var app = angular.module("myApp", []);

app.controller("navCtrl", function($scope) {
    $scope.name = "Navigation";
});

app.controller("rulesCtrl", function($scope) {
    $scope.name = "Rules";
});

app.controller("businessCtrl", function($scope, $interval) {
    $scope.name = "Business";
    var cnt = 0;
    $interval(function() { 
        $scope.name = "Business - " + cnt++; 
    }, 3000);
});

app.controller("sessionsCtrl", function($scope) {
    $scope.name = "Sessions";
    $scope.content = "Sessions";
});

app.controller("logsCtrl", function($scope, $interval) {
    $scope.name = "Logs";
    $scope.content = "Logs";
    var cnt = 0;
    $interval(function() { 
        $scope.name = "Logs - " + cnt++; 
    }, 5000);
});

app.directive('viewTree', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
        },
        templateUrl: function(elem, attrs) {
            return 'tree-view.html'; 
        }
    };
});

app.directive('viewTable', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
        },
        templateUrl: function(elem, attrs) {
            return 'table-view.html';
        }
    };
});

function nextActiveTab(tab) {
    var active = $(tab).prev('li:not(.dropdown-tabs)');
    if (active.length == 0) {
        active = $(tab).next('li');
    }
    if (active) {
        active.find('a').tab('show');
    }
}

function registerEventHandler(view) {
    $(view).on('tab-close', function( event, tab ) {
        if (confirm('Are you sure?')) {
            nextActiveTab(tab);
            tab.remove();
            $(view).remove(); 
        }
    });                
    $(view).on('tab-detach', function( event, tab, x, y ) { 
        nextActiveTab(tab);
        tab.remove();
        $(view).dialog().showView(x, y); 
    });
    $(view).on('tab-attach', function( event, slotContent ) { });
    $(view).on('view-resize', function( event, height, width ) {
        console.log('View Resize event: ' + this.id + " Height=" + height + " Width=" + width);
    });
    $(view).on('dialog-close', function( event, dialog ) {
        $(dialog).remove();
    });
}

window.onload = function() {
    $('.perspective').on('layout-change', function(event, json) {
        console.log(json);
    });
    $('.slot-tab').find('.view').each(function() {
        registerEventHandler($(this));
    });
}

function showAbout() {
    var view = $('<div class="view" id="about" name="About..."><h4>Bootstrap Perspective</h4><i>A small Bootstrap plugin that brings perspectives to your web application.</i></div>');
    registerEventHandler(view);
    view.dialog().showView();
    return false;
}
