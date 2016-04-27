//Get you accesstoken from LocalStorage if you've logged in before.
var access_token = localStorage.getItem("access_token");

//Delete accesstoken from LocalStorage, and reload page.
function logOut() {
  localStorage.removeItem("access_token");
  window.location.reload();
}

//replace Log-in button with Log-out button.
function showLogout(){
  document.getElementById('log-out').style.display = 'flex';
  document.getElementById('spark-login').style.display = 'none';
}

//execute function with possible arguments, and empty argument field.
function execute(deviceId, func) {
  argument = document.getElementById(func + 'input');
  spark.callFunction(deviceId,func,argument.value,null);
  argument.value = "";
};

//Get variable, and round it to 2 decimal numbers. This needs editing
//for data that are not numbers.
function update(deviceId, variable) {
  spark.getVariable(deviceId,variable,function(err, data){
    console.log(data);
    variableValue = document.getElementById(variable + deviceId);
    variableValue.value = data.result;
  });
};

//The login button logic from the library. Saves accestoken to LocalStorage.
sparkLogin(function(data){
  document.getElementById('spark-login-button').style.backgroundColor="#00E31A";
  document.getElementById('spark-login-button').innerHTML = 'Logging in, please wait.';
  console.log(data);
  access_token = data.access_token;
  localStorage.setItem("access_token", access_token);
  LoggedIn(data);
});

//If an accesstoken is still present from a login, then log in automatically.
if (access_token){
  console.log(access_token);
  console.log(document.getElementById('spark-login-button'));
  document.getElementById('spark-login-button').style.backgroundColor="#00E31A";
  document.getElementById('spark-login-button').innerHTML = 'Logging in, please wait.';
  spark.login({accessToken: access_token }, LoggedIn);
}

//everything that happens after logging in.
//This fills the fields with the relevant data, like function/variable/core names.
function LoggedIn(data){
  var devicesAt = spark.getAttributesForAll();
  console.log(access_token);
  //display events
  $('#events').append(
    '<a class="btn btn-primary btn-lg btn-block" href="https://api.spark.io/v1/devices/events/?access_token=' + access_token + '" target="_blank">Click here to see your events (opens in a new window)</a>'
  );

  devicesAt.then(
    function(data){
      console.log('Core attrs retrieved successfully:', data);
      for (var i = 0; i < data.length; i++) {
        console.log('Device name: ' + data[i].name);
        console.log('- connected?: ' + data[i].connected);

        //display status
        if (data[i].connected == true){
          status = "online";
          alert = "alert alert-success";
        }
        else{
          status = "offline";
          alert = "alert alert-danger";
        }
        $('#status tbody').append(
          '<tr class="' + alert + '"><td><strong>' + data[i].name + '</strong></td>' +
          '<td>' + data[i].id + '</td>' +
          '<td>' + status + '</td></tr>'
        );

        //display functions
        console.log('- functions: ' + data[i].functions);
        if (data[i].functions != null) {
          for (func in data[i].functions) {
            functionName = data[i].functions[func]
            $('#functions tbody').append(
              '<tr><td><strong>' + data[i].name + '</strong></td>' +
              '<td>' + functionName + '</td>' +
              //'<td><input class="form-control" type="text" id="' + functionName + '" value=""></td>' +
              //'<td><button class="btn btn-default form-control"  onclick="execute(\'' + data[i].id + '\', \'' + functionName + '\')">Execute</button></td>' +

              '<td><div class="input-group input-group-sm">' +
              '<input type="text" class="form-control" placeholder="Arguments?" id="' + functionName + 'input">'+
              '<span class="input-group-btn">' +
              '<button class="btn btn-default" type="button" onclick="execute(\'' + data[i].id + '\', \'' + functionName + '\')">go!</button>'+
              '</span>'+
              '</div></td>' +
              '</tr>'
            );
          }
        }

        //display variables
        console.log('- variables: ');
        if (data[i].variables != null) {
          for (variable in data[i].variables) {
            var type = data[i].variables[variable];
            console.log("variable: " + variable + " type: " + type);

            $('#variables tbody').append(
              '<tr><td><strong>' + data[i].name + '</strong></td>' +
              '<td>' + variable + '</td>' +
              //'<td id="' + variable + '">?</td>' +
              //'<td><button class="btn btn-default form-control" onclick="update(\'' + data[i].id + '\', \'' + variable + '\')">Update</button></td></tr>'

              '<td><div class="input-group input-group-sm">' +
              '<input type="text" class="form-control" placeholder="Click Get!" readonly id="' + variable + data[i].id + '">' +
              '<span class="input-group-btn">' +
              '<button class="btn btn-default" type="button" onclick="update(\'' + data[i].id + '\', \'' + variable + '\')">Get!</button>' +
              '</span>' +
              '</div></td>' +
              '</tr>'
            );
          }
        }


        $('#functions').show();
        $('#variables').show();
        $('#status').show();
        $('#events').show();
        showLogout();

        console.log("\n");
      }
    },
    function(err) {
      console.log('API call failed: ', err);
    }
  );
};
