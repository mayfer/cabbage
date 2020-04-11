curl -X PUT http://127.0.0.1:9201/teaorbit/_settings -H 'Content-Type: application/json' -d '
{
  "index": {
    "blocks": {
      "read_only_allow_delete": "false"
    }
  }
}'
