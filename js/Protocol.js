import ReusableBufferCache from "./ReusableBufferCache";

var Protocol = function(name){
  this.name = name;
  this.parameters = new Object();
  this.parameterIDsByParameterName = new Object();
  this.parameterBufferIndicesByParameterName = new Object();
}

Protocol.prototype.MAX_STRING_PARAMETER_LENGTH = 100;

Protocol.prototype.typeNumerical = {isNumerical: true, requiredBufferLen: 2};

Protocol.prototype.getCharByte = function(char){
  return 100;
}

Protocol.prototype.setParameterToBuffer = function(parameterName, value){
  var parameter = this.parameters[parameterName];
  if (!parameter){
    throw new Error("No such parameter: "+parameterName+" in protocol: "+this.name);
  }
  var startIndex = this.parameterBufferIndicesByParameterName[parameterName];
  var parameterID = this.parameterIDsByParameterName[parameterName];
  this.buffer[startIndex] = parameterID;
  if (parameter.isNumerical){
    this.buffer[startIndex + 1] = value;
  }else{
    if (value.length > parameter.maxLength){
      throw new Error("Parameter overflow: "+parameterName+" in protocol "+this.name);
    }
    var computationBuffers = ReusableBufferCache.get(parameter.requiredBufferLen);
    var uint8 = computationBuffers.uint8;
    for (var i = 0; i<uint8.length; i++){
      if (i < value.length){
        uint8[i] = this.getCharByte(value[i]);
      }else{
        uint8[i] = 0;
      }
    }
    var float32 = computationBuffers.float32;
    var curIndex = startIndex + 1;
    for (var i = 0; i<float32.length; i++){
      this.buffer[curIndex ++] = float32[i];
    }
  }
}

Protocol.prototype.addNumericalParameter = function(parameterName){
  this.parameters[parameterName] = this.typeNumerical;
}

Protocol.prototype.addStringParameter = function(parameterName, maxLength){
  if (maxLength > this.MAX_STRING_PARAMETER_LENGTH){
    throw new Error("Parameter size exceeds max allowed string parameter size "+this.MAX_STRING_PARAMETER_LENGTH);
  }
  this.parameters[parameterName] = {
    isNumerical: false, maxLength: maxLength, requiredBufferLen: (Math.ceil(maxLength / 4) + 1)
  };
}

Protocol.prototype.init = function(){
  var requiredBufferLen = 0;
  var curParameterID = 0;
  for (var parameterName in this.parameters){
    this.parameterIDsByParameterName[parameterName] = curParameterID ++;
    this.parameterBufferIndicesByParameterName[parameterName] = requiredBufferLen;
    var parameter = this.parameters[parameterName];
    requiredBufferLen += parameter.requiredBufferLen;
    if (!parameter.isNumerical){
      ReusableBufferCache.notify(requiredBufferLen);
    }
  }
  this.buffer = new Float32Array(requiredBufferLen);
}

export default Protocol;
