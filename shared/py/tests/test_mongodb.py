"""Tests for the :mod:`shared.py.mongodb` module."""

import importlib
import sys
import types
from unittest.mock import MagicMock, patch


def test_get_database_builds_connection_string_and_collections():
    """Ensure the database connection string and collection names are correct."""

    settings_stub = types.ModuleType("settings")
    settings_stub.MONGODB_HOST_NAME = "testhost"
    settings_stub.MONGODB_ADMIN_DATABASE_NAME = "admin_db"
    settings_stub.AGENT_NAME = "agentx"

    client_mock = MagicMock()
    db_mock = MagicMock()
    collections = {}

    def getitem(name: str) -> MagicMock:
        coll = MagicMock(name=name)
        collections[name] = coll
        return coll

    db_mock.__getitem__.side_effect = getitem
    client_mock.__getitem__.return_value = db_mock

    pymongo_stub = types.ModuleType("pymongo")
    pymongo_stub.MongoClient = MagicMock(return_value=client_mock)

    modules = {"shared.py.settings": settings_stub, "pymongo": pymongo_stub}
    with patch.dict(sys.modules, modules):
        from shared.py import mongodb

        importlib.reload(mongodb)

        db = mongodb.get_database()

        pymongo_stub.MongoClient.assert_called_with("mongodb://testhost/admin_db")
        assert db is db_mock

        expected = {
            "discord_message_collection": f"{settings_stub.AGENT_NAME}_discord_messages",
            "timmy_answers_collection": f"{settings_stub.AGENT_NAME}_timmy_answers",
            "timmy_answer_cache_collection": f"{settings_stub.AGENT_NAME}_timmy_answer_cache",
            "generated_message_collection": f"{settings_stub.AGENT_NAME}_generated_messages",
            "discord_channel_collection": f"{settings_stub.AGENT_NAME}_discord_channels",
            "discord_user_collection": f"{settings_stub.AGENT_NAME}_discord_users",
            "discord_server_collection": f"{settings_stub.AGENT_NAME}_discord_servers",
            "duck_gpt": f"{settings_stub.AGENT_NAME}_gpt",
        }

        for attr, name in expected.items():
            assert collections[name] is getattr(mongodb, attr)
