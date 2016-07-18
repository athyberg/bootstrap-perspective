# Bootstrap - Perspective #

_This is a small javascript plugin that adds 'perspectives' to your Bootstrap desktop web application._

Usually the look and feel of an average Bootstrap application tends to be more of a report than an actual desktop application (thanks to the idea of __"Mobile First"__ --- design everything for smartphones and pads/tablets first and big screens as an afterthought). This responsive design concept makes it difficult to use the Bootstrap framework for e.g. back-office desktop applications where the user don't want to scroll the web page but instead scroll different parts of the application independently.

The basic idea for this plugin is that if you arrange the content of your application using an ordinary description list __`<dl><dt><dd>`__ this plugin transforms that list into a fully fledged desktop application. The transformation is done by DOM manipulation and using the css __Flexbox__ container to distribute the different slots and their views into a desktop application. But if the user changes the browser window width below the given threshold then the application collapses back into a scrollable web application suitable for smartphones and pads/tablets. 

## Perspective? ##
In this case a perspective is the visual container for a set of views. The idea is that a perspective should provide a set of functionality aimed at accomplishing a specific type of task or to work with a specific type of resources. For example, an Accounting Perspective should combine views that you would commonly use while performing accounting work, while a Sales Perspective contains the views that you would use while managing your customer relations. 

The perspective is the 'root' container and is declared like this:
`<div class="perspective">...</div>`

A perspective is built using nested description lists `<dl>`, with terms `<dt>` and descriptions `<dd>`. 

## Slots ##
The `<dl>` tags defines _slots_ in which you can put one or more views or even nested slots. This plugin supports four kinds of slot types: _slot-split_, _slot-single_, _slot-tab_ and _slot-tray_. You need to add the base class name `class="slot"` to the `<dl>` tag to make it become a slot. You then add more class names to the tag to specify which kind of slot you want. 

### slot-split ###
There are two kinds of slot-splits, _vertical_ and _horizontal_. You define them by adding class names to the <dl> tag. Examples:
`<dl class="slot slot-split slot-split-vertical">...</dl>`
`<dl class="slot slot-split slot-split-horizontal">...</dl>`

The slot-split does exactly what it sounds like, it is a container that hosts two or more slots and inserts a handlebar between them so a user can resize the different panes by dragging the handlebar. By adding the class name _fixed_ to your slot-split you can prevent the user from being able to resize it. This can be handy if you want a fixed footer at the bottom of the web application.
`<dl class="slot slot-split slot-split-vertical fixed">...</dl>`

### slot-single ###
If you want an area of your desktop application to contain just one view then this is the slot you want. A user cannot attach or detach views in this kind of slot. You can set a default width or height by setting the _flex-basis_ value to either a percentage- or a fixed pixel value. Note that you also have to set the _flex-grow_ value to 0. 
`<dl class="slot slot-single" style="flex: 0 30%">...</dl>`

### slot-tab ###
A slot-tab can hold one or more views. The slot will render itself as Bootstrap Tabs. A user can bring up a context menu by right-clicking on a tab. The context menu has two buttons, detach and close. If a tab/view is detached from the slot-tab the view will be wrapped inside a dialog. 
A user can attach dialogs to a slot-tab by dragging and dropping the dialog over a tab-bar. If there are more views in the slot-tab than can be fitted inside the tab-bar the part of the tab-bar that doesn't fit will collapse into a dropdown. You can set a default width or height by setting the _flex-basis_ value to either a percentage- or a fixed pixel value. Note that you also have to set the _flex-grow_ value to 0. As the flexbox layout is direction-agnostic you don't need to specify direction. 
`<dl class="slot slot-tab" style="flex: 0 130px">...</dl>`

### slot-tray ###
A slot-tray is a special kind of slot in which you are supposed to add small widgets and labels. It's been added mainly to support the need for an application footer. You can set a default width or height by setting the _flex-basis_ value to either a percentage- or a fixed pixel value. Note that you also have to set the _flex-grow_ value to 0.
`<dl class="slot slot-tray footer" style="flex: 0 30px">...</dl>`

## Dialogs ##
Any web desktop application needs dialogs. This plugin provides a kind of dialog which is based on the Bootstrap Modal kind of dialogs, except that they aren't modal. If you want to create a view and wrap it inside a dialog you only have to like this:
```
var view = $('<div class="view" id="hello" name="Hello">Hello World!</div>');
// you need to register event handlers for your view
view.dialog().showView();
```
The showView() function can be called without any parameters. Then the dialog will be placed in the center of the perspective, but you can also provide a Top and a Left argument (.showView(top, left)) to place the dialogs top left corner wherever you want.


## Views ##
Views are ...
 
## Example of a perspective ##
Plain HTML
```
<div class="perspective">
    <dl class="slot slot-split slot-split-vertical fixed">
        <dt>ROOT</dt>
        <dd>
            <dl class="slot slot-split slot-split-horizontal">
                <dt>MAIN</dt>
                <dd>
                    <dl class="slot slot-single">
                        <dt>TREE STRUCTURE</dt>
                        <dd>
                            <div class="view" id="nav" name="Navigation">...</div>
                        </dd>
                    </dl>
                    <dl class="slot slot-split slot-split-vertical">
                        <dt>EDITORS</dt>
                        <dd>
                            <dl class="slot slot-tab">
                                <dt>METADATA</dt>
                                <dd>
                                    <div class="view active" id="formattingRules" name="Formatting Rules">...</div>
                                    <div class="view" id="businessRules" name="Business Rules">...</div>
                                </dd>
                            </dl>
                            <dl class="slot slot-tab">
                                <dt>SESSIONS, LOGS</dt>
                                <dd>
                                    <div class="view active" id="userSessions" name="User Sessions">...</div>
                                    <div class="view" id="logs" name="Logs">...</div>
                                </dd>
                            </dl>
                        </dd>
                    </dl>
                </dd>
            </dl>
            <dl class="slot slot-tray footer" style="flex: 0 30px">
                <dt>FOOTER</dt>
                <dd>
                    <div id="footerView" name="Footer" class="view">...</div>
                </dd>
            </dl>
        </dd>
    </dl>        
</div>
```


## Example ##
**[Basic demo built with AngularJS](http://bootapp.moobin.se)**


## Events ##
There are six events that are triggered from this plugin. Remember that it is always up to the application to decide what will happen whenever these events are triggered, there is no default behavior:

- 'tab-close' - triggered when the user tries to close a tab. 
Here is an example on how to use this event: 
```
var view = $(this);
$(view).on('tab-close', function( event, tab ) {
    if (confirm('Are you sure?')) {
        tab.remove();
        $(view).remove(); 
    }
});                
```
- 'tab-detach' - triggered whenever a user tries to detach a tab from is's slot.
Here is an example on how to use this event: 
```
var view = $(this);
$(view).on('tab-detach', function( event, tab, top, left ) { 
    tab.remove();
    $(view).dialog().show(top, left); 
});
```
- 'tab-attach' - triggered whenever a user tries to attach a dialog to a tab slot. 
- 'view-resize' - triggered whenever a view is resized. This is in its turn triggered by a window resize or the user resizing slots in the application. 

- 'dialog-close' - triggered when the user tries to close a dialog.

Here is an example on how to use this event: 

```
var view = $(this);
$(view).on('dialog-close', function( event, dialog ) {
    $(dialog).remove();
});
```
- 'layout-change' - triggered whenever the layout of the perspective has been changed, e.g. slots have been resized or tab order has been changed.
Here is an example on how to use this event: 

```
$('perspective').on('layout-change', function( event, json ) {
    // persist layout state
});
```


## Setting the perpective layout ##
$('perspective').trigger('set-layout', [ json ]);



## Contributors ##
Thanks to [moobin](https://bitbucket.org/moobin/) for inspiration.
