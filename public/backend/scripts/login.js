$(document).ready(function () {
    $.get("/usrgetloggedin/", function (data) {
      if (parseInt(data) !== 0) {
        window.location.href = "/backend/index.html"; // or your actual login path
      }
    });
  });

var LoginBox = React.createClass({
    getInitialState: function () {
        return {
            data: []
        };
    },
    handleLogin: function (logininfo) {

        $.ajax({
            url: '/loginuser/',
            dataType: 'json',
            type: 'POST',
            data: logininfo,
            success: function (data) {
                this.setState({ data: data });
                if (typeof data.redirect == 'string') {
                    window.location = data.redirect;
                }
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    render: function () {
        return (
            <div>
                <h1>Login</h1>
                <LoginForm onLoginSubmit={this.handleLogin} />
                <br />
                
            </div>
        );
    }
});

var LoginForm = React.createClass({
    getInitialState: function () {
        return {
            qc_useremail: "",
            qc_userpw: "",

        };
    },
    handleOptionChange: function (e) {
        this.setState({
            selectedOption: e.target.value
        });
    },
   
    handleSubmit: function (e) {
        e.preventDefault();

        var qc_userpw = this.state.qc_userpw.trim();
        var qc_useremail = this.state.qc_useremail.trim();
      
        this.props.onLoginSubmit({
            qc_userpw: qc_userpw,
            qc_useremail: qc_useremail
        });

    },
    handleChange: function (event) {
        this.setState({
            [event.target.id]: event.target.value
        });
    },
    render: function () {

        return (
            <div>
                <div id="theform">
                    <form onSubmit={this.handleSubmit}>

                        <table>
                            <tbody>
                                <tr>
                                    <th>User Email</th>
                                    <td>
                                        <input name="qc_useremail" id="qc_useremail" value={this.state.qc_useremail} onChange={this.handleChange} />
                                    </td>
                                </tr>
                                <tr>
                                    <th>User Password</th>
                                    <td>
                                        <input type = "password" name="qc_userpw" id="qc_userpw" value={this.state.qc_userpw} onChange={this.handleChange} />
                                    </td>
                                </tr>
                               
                            </tbody>
                        </table><br />
                        <input type="submit" value="Enter Login" />
                    </form>
                </div>
                <div>
                    <br />
                    <form onSubmit={this.getInitialState}>
                        <input type="submit" value="Clear Form" />
                    </form>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <LoginBox />,
    document.getElementById('content')
);

