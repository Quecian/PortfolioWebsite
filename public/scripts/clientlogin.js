

var LoginBox = React.createClass({
    getInitialState: function () {
      return {
        data: [],
      };
    },
    handleLogin: function (logininfo) {
      $.ajax({
        url: "/clientlogin",
        dataType: "json",
        type: "POST",
        data: logininfo,
        success: function (data) {
          this.setState({ data: data });
          if (typeof data.redirect == "string") {
            window.location = data.redirect;
          }
        }.bind(this),
        error: function (xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this),
      });
    },
  
    render: function () {
      return (
        <div className="login-container">
          <h1 className="login-title">Login</h1>
          <LoginForm onLoginSubmit={this.handleLogin} />
          <div className="signup-link">
            Don't have an account yet? <a href="signup.html">Sign Up</a>
          </div>
        </div>
      );
    },
  });
  
  var LoginForm = React.createClass({
    getInitialState: function () {
      return {
        qc_clientemail: "",
        qc_clientpw: "",
      };
    },
    handleOptionChange: function (e) {
      this.setState({
        selectedOption: e.target.value,
      });
    },
  
    handleSubmit: function (e) {
      e.preventDefault();
  
      var qc_clientpw = this.state.qc_clientpw.trim();
      var qc_clientemail = this.state.qc_clientemail.trim();
  
      this.props.onLoginSubmit({
        qc_clientpw: qc_clientpw,
        qc_clientemail: qc_clientemail,
      });
    },
    handleChange: function (event) {
      this.setState({
        [event.target.id]: event.target.value,
      });
    },
    handleClear: function (e) {
      e.preventDefault();
      this.setState(this.getInitialState()); // Reset the form
    },
    render: function () {
      return (
        <form onSubmit={this.handleSubmit}>
          <div className="input-group-login">
            <label htmlFor="qc_clientemail">Client Email</label>
            <input
              type="text"
              name="qc_clientemail"
              id="qc_clientemail"
              value={this.state.qc_clientemail}
              onChange={this.handleChange}
            />
          </div>
          <div className="input-group-login">
            <label htmlFor="qc_clientpw">Client Password</label>
            <input
              type="password"
              name="qc_clientpw"
              id="qc_clientpw"
              value={this.state.qc_clientpw}
              onChange={this.handleChange}
            />
          </div>
          <button type="submit" className="login-button">
            Enter Login
          </button>
          <button type="button" className="clear-button" onClick={this.handleClear}>
            Clear Form
          </button>
        </form>
      );
    },
  });
  
  ReactDOM.render(<LoginBox />, document.getElementById("content"));