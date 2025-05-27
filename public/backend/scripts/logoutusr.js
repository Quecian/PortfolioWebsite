"use strict";

var LogoutBox = React.createClass({
  loadAllowLogout: function (e) {
    e.preventDefault(); // prevent default form submission
    $.ajax({
      url: "/usrgetloggedout/",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ viewthepage: data });
        if (typeof data.redirect === "string") {
          window.location.href = data.redirect;
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  render: function () {
    return (
      <div>
        <button className="logout-btn" onClick={this.loadAllowLogout}>Logout</button>
      </div>
    );
  }
});

ReactDOM.render(<LogoutBox />, document.getElementById("logout"));
