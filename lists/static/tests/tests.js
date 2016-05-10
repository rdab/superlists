test("errors should be hidden on focus", function(){
    $('#id_text').trigger('focus');
    equal($('.has-error').is(':visible'), false);
});

test("errors not be hidden unless there is a keypress", function(){
    equal($('.has-error').is(':visible'), true);
});