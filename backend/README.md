# Griddle &mdash; Backend

An OpenAPI-enabled HTTP API written in python using FastAPI.

## Development

See the [wiki](../../wiki) for a full development guide.

Install dependencies and enter virtualenv:

```sh
pipenv install
pipenv shell
```

To start a dev server:

```bash
uvicorn main:app --reload
```

To autogenerate a migration:

```sh
alembic revision --autogenerate
```

## Contributing

See the [wiki](../../../wiki) for tips on contributing.
