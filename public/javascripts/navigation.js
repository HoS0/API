
function createSubmitForm(url) {
    var form = $('<form style="visibility: hidden" action="' + url + '" method="POST">' +
        '<input name="token" value="' + token + '" />' +
        '</form>');
    $('body').append(form);
    form.submit();
}

function UserVersionDistributionClicked() {

    createSubmitForm("/UserVersionDistribution");
}

function RegisteredUsersClicked() {

    createSubmitForm("/RegisteredUsers");
}

function PaidUsersClicked() {
    createSubmitForm("/PaidUsers");
}

function NotificationUsersClicked() {

    createSubmitForm("/NotificationUsers");
} 

function TaskManagerClicked() {

    createSubmitForm("/TaskManager");
} 

function output(str) {
  
    console.log(str);
}
