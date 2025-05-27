"use strict";

$(document).ready(function () {
  $.get("/usrgetloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "/backend/login.html"; 
    }
  });
});

