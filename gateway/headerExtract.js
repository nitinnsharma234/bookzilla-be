function extract_event_version(r) {
  var requestBody = r.requestBody;
  r.log(requestBody);
  var bodyJSON = JSON.parse(requestBody);

  if (bodyJSON.hasOwnProperty("eventVersion")) {
    return bodyJSON.eventVersion;
  }
  return "v1";
}

export default { extract_event_version };
