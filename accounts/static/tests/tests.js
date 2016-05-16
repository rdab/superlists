test("initialize binds sign in button to navigator.id.request", function(){
    var requestWasCalled = false;
    var mockRequestFunction = function () { requestWasCalled = true; };
    var mockNavigator = {
        id: {
            request: mockRequestFunction,
            watch: function(){}
        }
    };
    Superlists.Accounts.initialize(mockNavigator);
    equal(requestWasCalled, false, 'check request not called before click');
    $('#id_login').trigger('click');
    equal(requestWasCalled, true, 'check request called after click');
});

var user, token, urls, mockNavigator, requests, xhr;
QUnit.module("navigator.id.watch tests", {
    beforeEach: function () {
        user = 'current user';
        token = 'csrf token';
        urls = {login: 'login url', logout: 'logout url'};
        mockNavigator = {
            id: {
                watch: sinon.mock()
            }
        };
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function (request) { requests.push(request); };
    },
    afterEach: function () {
        mockNavigator.id.watch.reset();
        xhr.restore();
    }
});

test("initialize calls navigator.id.watch", function () {
    Superlists.Accounts.initialize(mockNavigator, user, token, urls);

    equal(
        mockNavigator.id.watch.calledOnce,
        true,
        'check watch function called'
    );
});

test("watch sees current user", function () {
    Superlists.Accounts.initialize(mockNavigator, user, token, urls);
    var watchCallArgs = mockNavigator.id.watch.firstCall.args[0];
    equal(
        watchCallArgs.loggedInUser,
        user,
        'check user'
    );
});

test("onlogin does ajax post to login url", function () {
    Superlists.Accounts.initialize(mockNavigator, user, token, urls);
    var onloginCallback = mockNavigator.id.watch.firstCall.args[0].onlogin;
    onloginCallback();
    equal(requests.length, 1, 'check ajax request');
    equal(requests[0].method, 'POST');
    equal(requests[0].url, urls.login, 'check url');
});

test("onlogin sends assertion with csrf token", function() {
    Superlists.Accounts.initialize(mockNavigator, user, token, urls);
    var onloginCallback = mockNavigator.id.watch.firstCall.args[0].onlogin;
    var assertion = 'browser-id assertion';
    onloginCallback(assertion);
    equal(
        requests[0].requestBody,
        $.param({assertion: assertion, csrfmiddlewaretoken: token}),
        'check POST data'
    );
});

test("onlogout is just a placeholder", function() {
    Superlists.Accounts.initialize(mockNavigator, user, token, urls);
    var onlogoutCallback = mockNavigator.id.watch.firstCall.args[0].onlogout;
    equal( typeof onlogoutCallback, "function", "onlogout should be a function");
});

test("onlogin post failure should do a navigator.id.logout", function () {
    mockNavigator.id.logout = sinon.mock();
    Superlists.Accounts.initialize(mockNavigator, user, token, urls);
    var onloginCallback = mockNavigator.id.watch.firstCall.args[0].onlogin;
    var server = sinon.fakeServer.create();
    server.respondWith([403, {}, "permission denied"]);

    onloginCallback();
    equal(mockNavigator.id.logout.called, false, 'should not logout yet');

    server.respond();
    equal(mockNavigator.id.logout.called, true, 'should call logout');
});