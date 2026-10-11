
import json
import logging
import re

from celery import shared_task
from django.core.cache import cache
from django.db import IntegrityError, transaction
from langchain_core.prompts import ChatPromptTemplate

from apps.game.models import Game, Player, Voting
from apps.game.llm import get_model

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
RETRY_DELAY = 5


VOTING_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an intelligent player in Trust No One, an Indian social
deduction game.

YOUR ROLE:
- GADDAR: Protect your identity and strategically direct suspicion.
- PARTNER: Analyze evidence and vote for the player most likely to be Gaddar.

RULES:
1. Your assigned role is final.
2. Never vote for yourself.
3. Choose exactly one player from VALID TARGETS.
4. Never invent evidence or conversations.
5. Analyze alibis, timelines, contradictions, and behavior.
6. An accusation alone does not prove guilt.
7. Never reveal your secret role or private information.
8. Other players' secret roles are unknown to you.
9. Copy the selected target UUID exactly from VALID TARGETS.
10. Return only valid JSON. No Markdown or additional text.
11. Complete the entire JSON object before responding.
12. Keep the reason under 15 words.

Return exactly this structure:
{{
  "receiver_id": "target UUID",
  "reason": "Brief strategic explanation"
}}
""",
        ),
        (
            "human",
            """
YOUR INFORMATION:
{bot_info}

GAME SCENARIO:
{game_scenario}

CONVERSATION HISTORY:
{conversation_history}

VALID TARGETS:
{valid_targets}

Choose one valid target and return the required JSON.
""",
        ),
    ]
)


def parse_vote_response(raw_output):
    """Parse and validate the LLM response."""

    if isinstance(raw_output, list):
        raw_output = "".join(
            item.get("text", "") if isinstance(item, dict) else str(item)
            for item in raw_output
        )

    raw_output = str(raw_output).strip()

    if not raw_output:
        logger.warning("Voting model returned an empty response.")
        raise ValueError("The model returned an empty response.")

    # Remove Markdown fences.
    raw_output = re.sub(
        r"^```(?:json)?\s*|\s*```$",
        "",
        raw_output,
        flags=re.IGNORECASE,
    ).strip()

    # Extract a complete JSON object.
    start = raw_output.find("{")
    end = raw_output.rfind("}")

    if start == -1 or end == -1 or end < start:
        logger.warning(
            "No complete JSON object in model response: %r",
            raw_output[:1000],
        )
        raise ValueError("The model returned no complete JSON object.")

    try:
        result = json.loads(raw_output[start : end + 1])
    except json.JSONDecodeError as exc:
        logger.warning(
            "Invalid JSON in model response: %r",
            raw_output[:1000],
        )
        raise ValueError("The model returned invalid JSON.") from exc

    if not isinstance(result, dict):
        raise ValueError("The model response must be a JSON object.")

    if not result.get("receiver_id"):
        raise ValueError("Missing receiver_id in model response.")

    return result


@shared_task(
    bind=True,
    ignore_result=True,
    max_retries=MAX_RETRIES,
    default_retry_delay=RETRY_DELAY,
)
def agent_vote(self, game_id, bot_id):
    try:
        game = Game.objects.get(id=game_id)

        if game.status != Game.Status.RUNNING:
            logger.info("Voting skipped: game %s is not running.", game_id)
            return

        bot = game.players.filter(id=bot_id).first()

        if bot is None or bot.is_human or not bot.is_alive:
            return

        # A bot can vote only once per game.
        if Voting.objects.filter(game=game, voter=bot).exists():
            logger.info("Bot %s has already voted.", bot_id)
            return

        players = game.players.filter(is_alive=True).exclude(id=bot.id)

        valid_targets = [
            {"id": str(player.id), "name": player.name}
            for player in players
        ]

        if not valid_targets:
            logger.warning("No valid targets for game %s.", game_id)
            return

        # Retrieve conversation history.
        history_key = f"history_{game_id}"
        conversation_history = cache.get(history_key)

        if conversation_history is None:
            conversation_history = list(
                game.conversations.order_by("created_at").values(
                    "sender_id",
                    "receiver_id",
                    "content",
                )
            )

            for item in conversation_history:
                item["sender_id"] = str(item["sender_id"])
                item["receiver_id"] = str(item["receiver_id"])

            cache.set(history_key, conversation_history, timeout=300)

        bot_info = {
            "id": str(bot.id),
            "name": bot.name,
            "role": bot.role,
            "personality": bot.personality or "",
            "private_information": bot.private_information or "",
            "alibi": bot.alibi or "",
        }

        # Generate the vote.
        llm = get_model("openai/gpt-oss-20b")
        chain = VOTING_PROMPT | llm

        response = chain.invoke(
            {
                "bot_info": json.dumps(bot_info),
                "game_scenario": json.dumps(game.scenario),
                "conversation_history": json.dumps(conversation_history),
                "valid_targets": json.dumps(valid_targets),
            }
        )

        result = parse_vote_response(response.content)

        receiver_id = result["receiver_id"]
        reason = result.get("reason", "")

        # Verify the target belongs to this game and is alive.
        if not players.filter(id=receiver_id).exists():
            raise ValueError("The model selected an invalid target.")

        # Lock the game and recheck before saving.
        with transaction.atomic():
            locked_game = Game.objects.select_for_update().get(id=game_id)

            if locked_game.status != Game.Status.RUNNING:
                return

            locked_bot = Player.objects.filter(
                id=bot_id,
                game=locked_game,
                is_human=False,
                is_alive=True,
            ).first()

            if locked_bot is None:
                return

            # Avoid duplicate votes.
            if Voting.objects.filter(
                game=locked_game,
                voter=locked_bot,
            ).exists():
                logger.info("Bot %s already voted.", bot_id)
                return

            target = Player.objects.filter(
                id=receiver_id,
                game=locked_game,
                is_alive=True,
            ).exclude(id=bot_id).first()

            if target is None:
                raise ValueError("Selected target is no longer eligible.")

            Voting.objects.create(
                game=locked_game,
                voter=locked_bot,
                target=target,
            )

        logger.info(
            "Bot %s voted for %s. Reason: %s",
            bot.name,
            target.name,
            reason,
        )

    except IntegrityError:
        # A concurrent task may already have saved this vote.
        if Voting.objects.filter(
            game_id=game_id,
            voter_id=bot_id,
        ).exists():
            logger.info("Bot %s vote already exists.", bot_id)
            return

        logger.exception(
            "Voting database integrity error: game_id=%s bot_id=%s",
            game_id,
            bot_id,
        )
        raise

    except Exception as exc:
        logger.exception(
            "Agent voting failed: game_id=%s bot_id=%s",
            game_id,
            bot_id,
        )

        # Retry failed tasks after five seconds, up to three times.
        raise self.retry(
            exc=exc,
            countdown=RETRY_DELAY,
            max_retries=MAX_RETRIES,
        )


@shared_task
def dispatch_agent_votes(game_id):
    """Schedule living AI players' votes five seconds apart."""

    bots = Player.objects.filter(
        game_id=game_id,
        is_human=False,
        is_alive=True,
    ).order_by("id")

    for index, bot in enumerate(bots):
        agent_vote.apply_async(
            args=[str(game_id), str(bot.id)],
            countdown=index * 5,
        )

