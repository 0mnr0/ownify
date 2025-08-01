{
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "User-Agent",
        "operation": "set",
        "value": "1.0"
      },
      {
        "header": "Referer",
        "operation": "remove"
      }
    ]
  },
  "condition": {
    "urlFilter": "*",
    "resourceTypes": ["main_frame", "sub_frame", "xmlhttprequest"]
  },
  "id": 1,
  "priority": 1
}
