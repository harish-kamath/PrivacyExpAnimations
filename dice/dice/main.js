"use strict";
var defaultEv = null;

function dice_initialize(container) {
    $t.remove($t.id('loading_text'));

    var canvas = $t.id('canvas');
    canvas.style.width = 100 + '%';
    canvas.style.height = 100 + '%';
    var label = $t.id('label');
    var set = $t.id('set');
    var selector_div = $t.id('selector_div');
    var info_div = $t.id('info_div');
    on_set_change();

    function a(ev){
      defaultEv = ev;
      if (selector_div.style.display == 'none') {
          if (!box.rolling) show_selector();
          box.rolling = false;
          return;
      }
      var name = box.search_dice_by_mouse(ev);
      if (name != undefined) {
          var notation = $t.dice.parse_notation(set.value);
          notation.set.push(name);
          set.value = $t.dice.stringify_notation(notation);
          on_set_change();
      }
    }

    $t.dice.use_true_random = false;

    function on_set_change(ev) { set.style.width = set.value.length + 3 + 'ex'; }
    $t.bind(set, 'keyup', on_set_change);
    $t.bind(set, 'mousedown', function(ev) { ev.stopPropagation(); });
    $t.bind(set, 'mouseup', function(ev) { ev.stopPropagation(); });
    $t.bind(set, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(set, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });


    var box = new $t.dice.dice_box(canvas, { w: 500, h: 300 });
    box.animate_selector = false;

    $t.bind(window, 'resize', function() {
        canvas.style.width = window.innerWidth - 1 + 'px';
        canvas.style.height = window.innerHeight - 1 + 'px';
        box.reinit(canvas, { w: 500, h: 300 });
    });

    function show_selector() {
        info_div.style.display = 'none';
        selector_div.style.display = 'inline-block';
        box.draw_selector();
    }

    function before_roll(vectors, notation, callback) {
        info_div.style.display = 'none';
        selector_div.style.display = 'none';
        // do here rpc call or whatever to get your own result of throw.
        // then callback with array of your result, example:
        // callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
        callback();
    }

    function notation_getter() {
        return $t.dice.parse_notation(set.value);
    }

    function after_roll(notation, result) {
      var res = result[0];
      if(res == 12){
        a(defaultEv);
      }
      else{
        currentRoll = res;
        label.innerHTML = res;
        info_div.style.display = 'inline-block';
      }
    }

    box.bind_mouse(container, notation_getter, before_roll, after_roll);
    box.bind_throw(container, notation_getter, before_roll, after_roll);




    $t.bind(container, ['mouseup'], function(ev) {
        ev.stopPropagation();
        a(ev);
    });

    var params = $t.get_url_params();
    if (params.notation) {
        set.value = params.notation;
    }
    if (params.roll) {
        $t.raise_event($t.id('throw'), 'mouseup');
    }
    else {
        show_selector();
    }
}
