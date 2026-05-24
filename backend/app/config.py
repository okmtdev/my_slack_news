from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    data_dir: str = "/app/data"
    admin_username: str = ""
    admin_password: str = ""
    cors_origins: str = "*"
    public_base_url: str = ""  # used when posting images to Slack; required for image posts

    class Config:
        env_file = ".env"


settings = Settings()
