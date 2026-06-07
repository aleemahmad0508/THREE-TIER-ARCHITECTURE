import os
from dotenv import load_dotenv

# This physically loads the variables from the .env file into your environment
load_dotenv() 

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False