from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
         model = User
         fields = [
             'email',
             'password'
         ]
         extra_kwargs = {
              'password':{
                   "write_only":True,
                   "min_length": 8
              },
              'email':{
                   "required":True,
                   
              }
         }

    def create(self, validated_data):

         user = User.objects.create_user(**validated_data)
         return user

class LoginSerializer(serializers.Serializer):
     email = serializers.EmailField(required = True)
     password = serializers.CharField()

     def validate(self, attrs):

          if not attrs['email']:
               raise serializers.ValidationError('email is required')

          if not attrs['password'] or len(attrs['password']) < 8:
               raise serializers.ValidationError('Please enter a valid password')

          user = authenticate(email = attrs['email'] , password = attrs['password'])
          if not user:
               raise serializers.ValidationError('user is not recognizable')

          attrs['user'] = user

          return attrs