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

// Add this as a utility function to the perspective
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
    $(view).on('view-close', function( event, container ) {
        if (confirm('Are you sure?')) {
            if (container.type === 'tab') {
                nextActiveTab(container);
            }
            $(view).remove(); 
            container.remove();                
        }
    });                
    $(view).on('view-detach', function( event, container, x, y ) { 
        if (container.type === 'tab') {
            nextActiveTab(container);
            container.remove();
        } 
        $(view).asDialog(x, y);
    });
    $(view).on('view-attach', function( event, slotContent ) { 
        console.log('View Attach Event: ' + this.id);
        console.log(slotContent);
    });
    $(view).on('view-active', function( event, container ) { 
        console.log('View Active Event: ' + this.id);
        console.log(container);
    });
    $(view).on('view-resize', function( event, height, width ) {
        console.log('View Resize Event: ' + this.id + " Height=" + height + " Width=" + width);
    });
    // deprecated ---
    // $(view).on('dialog-close', function( event, dialog ) {
    //    $(dialog).remove();
    // });
    // --- deprecated
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
    view.asDialog();
    return false;
}
