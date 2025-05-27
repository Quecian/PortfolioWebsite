"use strict";
$(document).ready(function () {
  $.get("/usrgetloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "/backend/login.html"; // or your actual login path
    }
  });
});
var usruser = 0;

var RoleBox = React.createClass({
  getInitialState: function () {
    return { data: [], viewthepage: 0 };
  },
  loadAllowLogin: function () {
    $.ajax({
      url: "/getloggedin",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ viewthepage: data });
        usruser = this.state.viewthepage;
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadRolesFromServer: function () {
    $.ajax({
      url: "/getroles", // Updated endpoint for roles
      data: {
        qc_rolename: qc_rolename.value,
        qc_roletype: qc_roletype.value,
        qc_rolepermissions: qc_rolepermissions.value,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getroles", status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadRolesFromServer();
  },

  render: function () {
    if (this.state.viewthepage == 3) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div className="RoleBox">
          <h1>Roles</h1>
          <RoleForm onRoleSubmit={this.loadRolesFromServer} />
          <br />
          <table>
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Role Type</th>
                <th>Role Permissions</th>
              </tr>
            </thead>
            <RoleList data={this.state.data} />
          </table>
        </div>
      );
    }
  },
});

var RoleForm = React.createClass({
  getInitialState: function () {
    return {
      qc_rolename: "",
      qc_roletype: "",
      qc_rolepermissions: "",
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var qc_rolename = this.state.qc_rolename.trim();
    var qc_roletype = this.state.qc_roletype.trim();
    var qc_rolepermissions = this.state.qc_rolepermissions.trim();

    this.props.onRoleSubmit({
      qc_rolename: qc_rolename,
      qc_roletype: qc_roletype,
      qc_rolepermissions: qc_rolepermissions,
    });
  },

  handleChange: function (event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  },

  render: function () {
    return (
      <form className="roleForm" onSubmit={this.handleSubmit}>
        <h2>Role Details</h2>
        <table>
          <tbody>
            <tr>
              <th>Role Name</th>
              <td>
                <input
                  type="text"
                  name="qc_rolename"
                  id="qc_rolename"
                  placeholder="Role Name"
                  value={this.state.qc_rolename}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Role Type</th>
              <td>
                <input
                  type="text"
                  name="qc_roletype"
                  id="qc_roletype"
                  placeholder="Role Type"
                  value={this.state.qc_roletype}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Role Permissions</th>
              <td>
                <input
                  type="text"
                  name="qc_rolepermissions"
                  id="qc_rolepermissions"
                  placeholder="Role Permissions"
                  value={this.state.qc_rolepermissions}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Search Roles" />
      </form>
    );
  },
});

var RoleList = React.createClass({
  render: function () {
    var roleNodes = this.props.data.map(function (role) {
      return (
        <Role
          key={role.qc_roleid} // Assuming qc_roleid is unique
          qc_rolename={role.qc_rolename}
          qc_roletype={role.qc_roletype}
          qc_rolepermissions={role.qc_rolepermissions}
        />
      );
    });

    return <tbody>{roleNodes}</tbody>;
  },
});

var Role = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.qc_rolename}</td>
        <td>{this.props.qc_roletype}</td>
        <td>{this.props.qc_rolepermissions}</td>
      </tr>
    );
  },
});

ReactDOM.render(<RoleBox />, document.getElementById("content"));
