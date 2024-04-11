FROM python:3.10 as requirements-stage

WORKDIR /tmp

RUN pip install pipenv

COPY ./Pipfile ./Pipfile.lock /tmp/

RUN pipenv requirements > requirements.txt

FROM python:3.10

WORKDIR /code

COPY --from=requirements-stage /tmp/requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
