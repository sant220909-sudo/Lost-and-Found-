from jinja2 import Environment
from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import reverse

def environment(**options):
    # Expose Django helpers to Jinja2 templates:
    # - static(): build URLs for static assets
    # - url(): reverse-resolve Django named routes
    env = Environment(**options)
    env.globals.update({
        "static": staticfiles_storage.url,
        "url": reverse,
    })
    return env
