import Protocol from "./Protocol";

var ProtocolParser = function(){
  this.NUMERICAL_TYPE = "numerical";
  this.CHARACTER_TYPE = "char";
}

ProtocolParser.prototype.parseCharacterType = function(characterType){
  var splitted = characterType.split("_");
  if (splitted[0] == this.CHARACTER_TYPE){
    if (!splitted[1]){
      return false;
    }
    return parseInt(splitted[1]);
  }
  return false;
}
ProtocolParser.prototype.parseProtocol = function(protocolInfo, protocolName){
  var protocol = new Protocol(protocolName);
  for (var parameterName in protocolInfo){
    var parameterType = protocolInfo[parameterName];
    if (parameterType == this.NUMERICAL_TYPE){
      protocol.addNumericalParameter(parameterName);
    }else if (parameterType.startsWith(this.CHARACTER_TYPE)){
      var maxLength = this.parseCharacterType(parameterType);
      if (!maxLength){
        throw new Error("Char types must be in format char_N, where N is the char length.")
      }
      protocol.addStringParameter(parameterName, maxLength);
    }else{
      throw new Error("Invalid parameter type.");
    }
  }
  protocol.init();
  return protocol;
}

ProtocolParser.prototype.parse = function(jsonData){
  var parsedProtocols = new Object();
  for (var protocolName in jsonData){
    var protocolInfo = jsonData[protocolName];
    var protocol = this.parseProtocol(protocolInfo, protocolName);
    parsedProtocols[protocol.name] = protocol;
  }
  return parsedProtocols;
}

export default new ProtocolParser();
