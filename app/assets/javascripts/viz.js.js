// Generated by CoffeeScript 1.6.2
var add_axis, add_bars, add_labels, add_legend, add_states, bar_chart, bar_x, bar_y, bring_to_top, calculate_percentages, calculate_scores, change_green_val, chart_colors, chart_group, chart_x_scale, compare_click, compare_states_mode, default_click, ensure_proper_size, fill_color, focus_bars, get_absolute, get_chart_data, get_focused, get_labels, get_x_scale, green_scale, height, hide_tooltip, highlight_bars, legend_positions, make_chart, make_hash_series, margins, over_time, red_scale, regular_state_mode, setup_chart, show_map, show_tooltip, state_hover, state_unhover, states_fade_in, stream_data, streamgraph, title, title_string, to_compare, toggle_controls, toggle_sliders, tooltip, tooltip_says, translations, unhighlight_bars, update_bars, width, x_label, _index1, _index2, _max, _min, _percentages, _scores, _totals;

green_scale = d3.scale.linear().domain([0, 10]).range(['grey', 'green']);

red_scale = d3.scale.linear().domain([0, 10]).range(['grey', 'red']);

_scores = {};

_percentages = {};

_totals = {};

_max = 2012;

_min = 2001;

_index1 = 0;

_index2 = 0;

margins = {
  top: 25,
  right: 100,
  bottom: 120,
  left: 50
};

width = 959;

height = 593;

chart_colors = void 0;

chart_group = void 0;

tooltip = void 0;

translations = void 0;

to_compare = [];

chart_x_scale = void 0;

over_time = true;

$(function() {
  var abbrev, type, weight, _i, _len, _ref, _ref1;

  chart_group = d3.select("#chart_group");
  width = d3.select('svg')[0][0].width.baseVal.value;
  height = d3.select('svg')[0][0].height.baseVal.value;
  chart_colors = gon.pie_colors;
  translations = gon.translations;
  _ref = gon.state_abbrevs;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    abbrev = _ref[_i];
    calculate_scores(abbrev);
    calculate_percentages(abbrev);
  }
  _ref1 = gon.green;
  for (type in _ref1) {
    weight = _ref1[type];
    $("#" + type + "_slider").slider({
      animate: true,
      max: 10,
      min: -10,
      step: .1,
      orientation: "vertical",
      value: weight,
      slide: function(event, ui) {
        return change_green_val(ui.handle.parentElement.id.slice(0, -7), ui.value);
      }
    });
    $("#" + type + "_input").on('change', function(eventObject) {
      return change_green_val(this.id.slice(0, -6), this.value);
    });
  }
  $("#time").slider({
    animate: true,
    max: _max,
    min: _min,
    orientation: "horizontal",
    step: 1,
    value: _max,
    slide: function(event, ui) {
      var state, _j, _len1, _ref2, _results;

      $('#year').text("Year: " + ui.value);
      _index1 = _max - ui.value;
      update_bars();
      _ref2 = gon.state_abbrevs;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        state = _ref2[_j];
        _results.push(d3.selectAll("#" + state).attr('fill', fill_color(state)));
      }
      return _results;
    }
  });
  $('#year').text("Year: " + _max + " (change with the slider below)");
  $('#year_compare').hide();
  $('#year_compare').slider({
    animate: true,
    orientation: "horizontal",
    step: 1,
    range: true,
    max: _max,
    min: _min,
    step: 1,
    values: [_max - 2, _max],
    slide: function(event, ui) {
      var state, _j, _len1, _ref2, _results;

      _index1 = _max - ui.values[0];
      _index2 = _max - ui.values[1];
      $('#year').text("" + ui.values[0] + " - " + ui.values[1]);
      update_bars();
      _ref2 = gon.state_abbrevs;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        state = _ref2[_j];
        _results.push(d3.selectAll("#" + state).attr('fill', fill_color(state)));
      }
      return _results;
    }
  });
  states_fade_in();
  d3.selectAll('.state').on('mouseover', function() {
    return state_hover(this.id);
  }).on('mouseleave', function() {
    return state_unhover(this.id);
  }).on('click', function() {
    return default_click(this.id);
  });
  tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
  d3.select('body').on('keydown', function() {
    if (d3.event.keyCode === 27) {
      return show_map(false);
    }
  });
  $('#scale_absolute').on('click', update_bars);
  $('#scale_relative').on('click', update_bars);
  $('#make_chart').hide();
  $('#controls').hide();
  $('#close').hide();
  $('#replay').on('click', states_fade_in);
  $('#compare').on('click', compare_states_mode);
  $('#make_chart').on('click', make_chart);
  $('#close').on('click', function() {
    return show_map(false);
  });
  $('#controls_toggle').on('click', toggle_controls);
  $('#equalizer').hide();
  $('#equalizer_toggle').on('click', toggle_sliders);
  $('#chart_controls').hide();
  chart_group.append('rect').attr('id', 'veil').attr('width', width).attr('height', height).attr('fill', 'white').attr('opacity', '0.75').on('click', show_map);
  chart_group.append('text').style('text-anchor', 'middle').attr('x', width / 2).attr('y', height / 2).attr('font-size', 25).text("Click a state to see its electricity history").on('click', show_map);
  chart_group.append('foreignObject').on('click', show_map).attr('class', 'btn').attr('x', width / 2 - 100).attr('y', height / 2 + 20).attr('width', 200).attr('height', 40).attr('id', 'okay_button');
  return chart_group.append('text').style('text-anchor', 'middle').attr('x', width / 2).attr('y', height / 2 + 45).text('Alrighty!').attr('font-size', 20).on('click', show_map);
});

calculate_scores = function(state) {
  var gigawatts, i, k, scores, state_data, toAdd, totals, v, _i, _ref;

  state_data = gon.elec_data[state];
  scores = [];
  totals = [];
  _max = 0;
  for (k in state_data) {
    v = state_data[k];
    if (typeof v !== typeof "") {
      if (v[0][0] > _max) {
        _max = v[0][0];
      }
      for (i = _i = 0, _ref = v.length; _i < _ref; i = _i += 1) {
        gigawatts = parseFloat(v[i][1]);
        if ($.isNumeric(gigawatts)) {
          if (gigawatts < 0) {

          } else {
            if (!$.isNumeric(scores[i])) {
              scores[i] = 0;
            }
            if (!$.isNumeric(totals[i])) {
              totals[i] = 0;
            }
            toAdd = gon.green[k] * gigawatts;
            scores[i] += toAdd;
            totals[i] += gigawatts;
          }
        }
      }
    }
  }
  _scores[state] = scores;
  return _totals[state] = totals;
};

calculate_percentages = function(state) {
  var i, k, percentage_series, percentages, state_data, totals, v, _i, _ref;

  state_data = gon.elec_data[state];
  totals = _totals[state];
  percentages = {};
  for (k in state_data) {
    v = state_data[k];
    if (typeof v !== typeof "") {
      percentage_series = [];
      for (i = _i = 0, _ref = v.length; _i < _ref; i = _i += 1) {
        percentage_series[i] = v[i][1] / totals[i] * 100;
      }
      percentages[k] = percentage_series;
    }
  }
  return _percentages[state] = percentages;
};

states_fade_in = function() {
  return d3.selectAll('.state').attr('fill', 'white').attr('stroke', 'white').attr('stroke-width', '0.75').transition().duration(500).delay(function(d, i) {
    return i * 40;
  }).attr('fill', function() {
    var abbrev;

    abbrev = this.id;
    return fill_color(abbrev);
  });
};

state_hover = function(id) {
  bring_to_top(id);
  return d3.selectAll("#" + id).attr('fill', fill_color(id)).transition().duration(200).attr('stroke', 'black').attr('stroke-width', '1.5');
};

state_unhover = function(id) {
  if (d3.select("#" + id).datum() !== 2) {
    return d3.selectAll("#" + id).attr('fill', fill_color(id)).transition().duration(200).attr('stroke', 'white').attr('stroke-width', '0.75');
  }
};

change_green_val = function(type, value) {
  var state, _i, _len, _ref, _results;

  $("#" + type + "_slider").slider("value", value);
  $("#" + type + "_input").val(value);
  gon.green[type] = value;
  _ref = gon.state_abbrevs;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    state = _ref[_i];
    calculate_scores(state);
    _results.push(d3.selectAll("#" + state).attr('fill', fill_color(state)));
  }
  return _results;
};

fill_color = function(state) {
  var color, gradient;

  gradient = (_scores[state][_index1] / _totals[state][_index1]) * 10;
  if (gradient > 0) {
    color = green_scale(gradient);
  } else {
    color = red_scale(-gradient);
  }
  return color;
};

bring_to_top = function(id_to_top) {
  var state, _i, _len;

  d3.selectAll('path').datum(-1);
  d3.select("#" + id_to_top).datum(1);
  for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
    state = to_compare[_i];
    d3.select("#" + state).datum(2);
  }
  return d3.selectAll('path').sort().order();
};

show_map = function(comparing) {
  var state, _i, _len;

  $('#chart_controls').slideUp();
  chart_group.selectAll('#okay_button').remove();
  chart_group.selectAll('g').remove();
  chart_group.selectAll('rect').remove();
  chart_group.selectAll('text').remove();
  chart_group.selectAll('.layer').remove();
  $('#close').hide();
  d3.selectAll('.legend_label').remove();
  d3.selectAll('.bar_label').remove();
  if (!comparing) {
    for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
      state = to_compare[_i];
      state_unhover(state);
    }
    to_compare.length = 0;
  }
  chart_x_scale = null;
  return regular_state_mode();
};

show_tooltip = function() {
  return tooltip.transition().duration(300).style('opacity', 1);
};

tooltip_says = function(text) {
  return tooltip.text(text).style('left', "" + d3.event.pageX + "px").style('top', "" + d3.event.pageY + "px");
};

hide_tooltip = function() {
  return tooltip.transition().duration(300).style('opacity', 0);
};

legend_positions = function(index) {
  var x, y;

  x = 125 * Math.floor(index / 2) + 15;
  y = height + 25 * (index % 2) + 15 - 62;
  return [x, y];
};

ensure_proper_size = function() {
  var bar, label, labels, state_id, _i, _len, _results;

  labels = get_labels();
  _results = [];
  for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
    state_id = to_compare[_i];
    _results.push((function() {
      var _j, _len1, _results1;

      _results1 = [];
      for (_j = 0, _len1 = labels.length; _j < _len1; _j++) {
        label = labels[_j];
        bar = d3.select("#" + state_id + "_" + label + "_bar");
        _results1.push(bar.attr('width', function() {
          return chart_x_scale(Math.abs(bar.data()));
        }));
      }
      return _results1;
    })());
  }
  return _results;
};

highlight_bars = function(focused) {
  var bar, box, label, labels, state_id, text, _i, _len, _results;

  if (!over_time) {
    ensure_proper_size();
  }
  labels = get_labels();
  _results = [];
  for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
    state_id = to_compare[_i];
    _results.push((function() {
      var _j, _len1, _results1;

      _results1 = [];
      for (_j = 0, _len1 = labels.length; _j < _len1; _j++) {
        label = labels[_j];
        if (over_time) {
          bar = d3.select("#" + label + "_layer");
        } else {
          bar = d3.select("#" + state_id + "_" + label + "_bar");
        }
        box = d3.select("#" + label + "_box");
        text = d3.select("#" + label + "_label");
        d3.select('#veil').transition().duration(200).attr('opacity', .9);
        if (focused.indexOf(label) > -1) {
          bar.transition().duration(150).attr('opacity', 1);
          box.transition().duration(200).attr('opacity', 1);
          _results1.push(text.transition().duration(200).attr('opacity', 1));
        } else {
          bar.transition().duration(150).attr('opacity', .1);
          box.transition().duration(200).attr('opacity', .2);
          _results1.push(text.transition().duration(200).attr('opacity', .2));
        }
      }
      return _results1;
    })());
  }
  return _results;
};

unhighlight_bars = function() {
  var focused, labels;

  if (!over_time) {
    ensure_proper_size();
  }
  focused = get_focused();
  labels = get_labels();
  if (focused.length > 0) {
    return highlight_bars(focused);
  } else {
    d3.select('#veil').transition().duration(200).attr('opacity', .75);
    d3.selectAll('.legend_box').transition().duration(200).attr('opacity', 1);
    d3.selectAll('.legend_label').transition().duration(200).attr('opacity', 1);
    if (over_time) {
      return d3.selectAll('.layer').transition().duration(200).attr('opacity', 1);
    } else {
      return d3.selectAll('.bar').transition().duration(150).attr('opacity', 1);
    }
  }
};

update_bars = function() {
  var absolute, data, label, labels, numbers, state_id, x_scale, _i, _len, _results;

  if (chart_x_scale != null) {
    absolute = get_absolute();
    x_scale = add_axis(absolute);
    chart_x_scale = x_scale;
    _results = [];
    for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
      state_id = to_compare[_i];
      data = get_chart_data(state_id, absolute);
      labels = data[0];
      numbers = data[1];
      _results.push((function() {
        var _j, _len1, _results1;

        _results1 = [];
        for (_j = 0, _len1 = labels.length; _j < _len1; _j++) {
          label = labels[_j];
          _results1.push(d3.selectAll("#" + state_id + "_" + label + "_bar").datum(numbers[labels.indexOf(label)]).transition().duration(200).attr('x', function(d, i) {
            return bar_x(numbers, labels.indexOf(label), x_scale);
          }).attr('width', function(d, i) {
            return x_scale(Math.abs(d));
          }));
        }
        return _results1;
      })());
    }
    return _results;
  }
};

toggle_controls = function() {
  var button, controls;

  controls = $('#controls');
  button = $('#controls_toggle');
  if (controls.is(':visible')) {
    controls.slideUp();
    return button.text('Show controls');
  } else {
    controls.slideDown();
    button.text('Hide controls');
    return $('html,body').scrollTo(0, 600);
  }
};

toggle_sliders = function() {
  var button, equalizer;

  equalizer = $('#equalizer');
  button = $('#equalizer_toggle');
  $('#please_click').slideUp();
  if (equalizer.is(':visible')) {
    button.text("Show sliders");
    return equalizer.slideUp();
  } else {
    button.text("Hide sliders");
    return equalizer.slideDown();
  }
};

title_string = function() {
  var i, string, _i, _ref;

  string = "Comparing Electricity Production of " + gon.state_names[to_compare[0]];
  for (i = _i = 1, _ref = to_compare.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
    if (i !== to_compare.length - 1) {
      string += ", " + gon.state_names[to_compare[i]];
    } else {
      string += " and " + gon.state_names[to_compare[i]];
    }
  }
  return string += " in " + (_max - _index1) + " ";
};

x_label = function() {
  var text;

  if (get_absolute()) {
    text = "Gigawatt-Hours Generated";
  } else {
    text = "Percentage of Total State Electricity Generated";
  }
  return chart_group.append('text').attr('id', 'x_axis_label').style('text-anchor', 'middle').attr('x', width / 2).attr('y', height - 80).text(text);
};

setup_chart = function() {
  chart_group.append('rect').attr('id', 'veil').attr('width', width).attr('height', height).attr('fill', 'white').attr('opacity', '0.75');
  chart_group.append('rect').attr('id', 'top_stuff').attr('width', width).attr('height', margins['bottom'] / 1.6).attr('y', height - margins['bottom'] / 1.6).attr('fill', 'white').attr('opacity', 0.75);
  add_legend();
  title(title_string());
  return $('#controls').slideDown();
};

add_legend = function() {
  var color, index, positions, type, x, y, _results;

  index = 0;
  chart_group.append('text').style('text-anchor', 'middle').attr('x', width / 2).attr('y', height - 55).text('Legend');
  _results = [];
  for (type in chart_colors) {
    color = chart_colors[type];
    positions = legend_positions(index);
    x = positions[0];
    y = positions[1];
    chart_group.append('rect').datum(false).attr('class', 'legend_box').attr('id', "" + type + "_box").attr('fill', color).attr('stroke', 'white').attr('stroke-width', .75).attr('width', 16).attr('height', 16).attr('x', function() {
      return x;
    }).attr('y', function() {
      return y;
    }).on('mouseover', function() {
      return highlight_bars([this.id.slice(0, -4)]);
    }).on('mouseleave', unhighlight_bars).on('click', function() {
      return focus_bars(this.id.slice(0, -4));
    });
    chart_group.append('text').attr('class', 'legend_label').attr('id', "" + type + "_label").text(translations[type]).attr('x', function() {
      return x + 20;
    }).attr('y', function() {
      return y + 13;
    }).attr('font-size', function() {
      var smaller;

      smaller = ['pet_coke', 'pet_liquid', 'other_renew', 'other_gases'];
      if (smaller.indexOf(this.id.slice(0, -6)) > -1) {
        return 12;
      } else {
        return 17;
      }
    }).on('mouseover', function() {
      return highlight_bars([this.id.slice(0, -6)]);
    }).on('mouseleave', unhighlight_bars);
    _results.push(index += 1);
  }
  return _results;
};

add_states = function() {
  return chart_group.selectAll('g').data(to_compare).enter().append('g').attr('id', function(d, i) {
    return d + "_bars";
  });
};

add_axis = function(absolute) {
  var x_scale;

  d3.select('.axis').remove();
  x_scale = get_x_scale(absolute);
  chart_group.append('g').call(d3.svg.axis().scale(x_scale).orient('bottom').tickFormat(function(d) {
    return d.toString();
  })).attr('class', 'axis').attr('transform', "translate(" + margins['left'] + ", " + (height - margins['bottom']) + ")");
  return x_scale;
};

add_bars = function() {
  var absolute, data, labels, numbers, state_id, x_scale, _i, _len, _results;

  absolute = get_absolute();
  x_scale = add_axis(absolute);
  x_label();
  chart_x_scale = x_scale;
  _results = [];
  for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
    state_id = to_compare[_i];
    data = get_chart_data(state_id, absolute);
    labels = data[0];
    numbers = data[1];
    _results.push(d3.select("#" + state_id + "_bars").selectAll('rect').data(numbers).enter().append('rect').attr('class', 'bar').attr('id', function(d, i) {
      return "" + state_id + "_" + labels[i] + "_bar";
    }).attr('y', function(d, i) {
      return bar_y("" + state_id + "_bars");
    }).attr('x', function(d, i) {
      return bar_x(numbers, i, x_scale);
    }).attr('width', function() {
      return 0;
    }).attr('height', 18).attr('fill', function(d, i) {
      return chart_colors[labels[i]];
    }).attr('opacity', 1).on('mouseover', function() {
      return highlight_bars([this.id.slice(3, -4)]);
    }).on('click', function() {
      return focus_bars(this.id.slice(3, -4));
    }).on('mouseleave', unhighlight_bars).transition().duration(500).delay(function(d, i) {
      return i * 50;
    }).attr('width', function(d, i) {
      return x_scale(Math.abs(d));
    }));
  }
  return _results;
};

add_labels = function() {
  var state_id, _i, _len, _results;

  _results = [];
  for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
    state_id = to_compare[_i];
    _results.push(chart_group.append('text').attr('id', "" + state_id + "_label").attr('class', 'bar_label').attr('x', 0).attr('y', function() {
      return bar_y("" + state_id + "_bars") + 18;
    }).text("" + state_id));
  }
  return _results;
};

title = function(text) {
  d3.select('#chart_title').remove();
  return chart_group.append('text').attr('id', 'chart_title').style('text-anchor', 'middle').attr('x', width / 2).attr('y', margins['top'] - 7).attr('font-size', 20).text(text);
};

bar_x = function(numbers, i, x_scale) {
  var j, start, _i, _j;

  start = margins['left'];
  if (numbers[i] > 0) {
    for (j = _i = 0; _i < i; j = _i += 1) {
      if (numbers[j] > 0) {
        start += x_scale(numbers[j]);
      }
    }
  } else {
    for (j = _j = 0; _j <= i; j = _j += 1) {
      if (numbers[j] < 0) {
        start += x_scale(numbers[j]);
      }
    }
  }
  return start;
};

get_chart_data = function(state_id, absolute) {
  var labels, numbers, series, to_append, type, _ref, _ref1;

  labels = [];
  numbers = [];
  if (absolute) {
    _ref = gon.elec_data[state_id];
    for (type in _ref) {
      series = _ref[type];
      labels[labels.length] = type;
      if (typeof series === typeof "") {
        numbers[numbers.length] = 0;
      } else {
        to_append = series[_index1][1];
        if (!to_append) {
          to_append = 0;
        }
        numbers[numbers.length] = to_append;
      }
    }
  } else {
    _ref1 = _percentages[state_id];
    for (type in _ref1) {
      series = _ref1[type];
      labels[labels.length] = type;
      numbers[numbers.length] = series[_index1];
    }
  }
  return [labels, numbers];
};

get_labels = function() {
  var labels, trans, type;

  labels = [];
  for (type in translations) {
    trans = translations[type];
    labels[labels.length] = type;
  }
  return labels;
};

get_x_scale = function(absolute) {
  var max, num, numbers, state_id, sum, _i, _j, _len, _len1;

  max = 0;
  for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
    state_id = to_compare[_i];
    sum = 0;
    numbers = get_chart_data(state_id, absolute)[1];
    for (_j = 0, _len1 = numbers.length; _j < _len1; _j++) {
      num = numbers[_j];
      sum += Math.abs(num);
    }
    if (sum > max) {
      max = sum;
    }
  }
  return d3.scale.linear().domain([0, max]).range([0, width - margins['left'] - margins['right']]);
};

bar_y = function(bar_id) {
  var bar_num, g, num_bars, _i, _len, _ref;

  num_bars = 1;
  bar_num = 0;
  _ref = chart_group.selectAll('g')[0];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    g = _ref[_i];
    if (g.id) {
      if (g.id === bar_id) {
        bar_num = num_bars;
      }
      num_bars += 1;
    }
  }
  return (height - margins['bottom']) * (bar_num / num_bars);
};

focus_bars = function(type) {
  var box;

  box = d3.select("#" + type + "_box");
  return box.datum(!box.datum());
};

get_focused = function() {
  var box, label, labels, toReturn, _i, _len;

  toReturn = [];
  labels = get_labels();
  for (_i = 0, _len = labels.length; _i < _len; _i++) {
    label = labels[_i];
    box = d3.select("#" + label + "_box");
    if (box.datum()) {
      toReturn[toReturn.length] = label;
    }
  }
  return toReturn;
};

get_absolute = function() {
  return $('#scale_absolute').is(':checked');
};

default_click = function(id) {
  to_compare[to_compare.length] = id;
  return make_chart();
};

compare_click = function(id) {
  if (to_compare.indexOf(id) === -1) {
    to_compare[to_compare.length] = id;
    d3.select("#" + id).datum(2);
    return state_hover(id);
  } else {
    to_compare.splice(to_compare.indexOf(id), 1);
    d3.select("#" + id).datum(0);
    return state_unhover(id);
  }
};

compare_states_mode = function() {
  var state, _i, _len;

  show_map(true);
  over_time = false;
  for (_i = 0, _len = to_compare.length; _i < _len; _i++) {
    state = to_compare[_i];
    state_hover(state);
  }
  $('#compare').hide();
  $('#make_chart').show();
  return d3.selectAll('.state').on('click', null).on('click', function() {
    return compare_click(this.id);
  });
};

regular_state_mode = function() {
  var abbrev, _i, _len, _ref;

  over_time = true;
  _ref = gon.state_abbrevs;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    abbrev = _ref[_i];
    state_unhover(abbrev);
  }
  $('#make_chart').hide();
  $('#compare').show();
  return d3.selectAll('.state').on('click', null).on('click', function() {
    return default_click(this.id);
  });
};

bar_chart = function() {
  $('#chart_controls').slideDown();
  add_states();
  add_bars();
  return add_labels();
};

make_chart = function() {
  $('#make_chart').hide();
  $('#compare').show();
  $('#close').show();
  setup_chart();
  if (to_compare.length) {
    if (over_time) {
      return streamgraph();
    } else {
      return bar_chart();
    }
  } else {
    return chart_group.append('text').style('text-anchor', 'middle');
  }
};

streamgraph = function() {
  var area, layers, stack, stream_x, stream_y, x_axis, y_axis;

  stack = d3.layout.stack().values(function(d) {
    return d.values;
  });
  layers = stack(stream_data());
  stream_x = d3.scale.linear().domain([_min, _max]).range([margins['left'] * 2, width - margins['right']]);
  x_axis = d3.svg.axis().scale(stream_x).orient('bottom').tickFormat(function(d) {
    return d.toString();
  });
  chart_group.append('g').attr('class', 'axis').attr('transform', "translate(0, " + (height - margins['bottom']) + ")").call(x_axis);
  stream_y = d3.scale.linear().domain([
    d3.max(layers, function(d) {
      var max_so_far, possible, value, _i, _len, _ref;

      max_so_far = 0;
      _ref = d.values;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        value = _ref[_i];
        possible = value.y0 + value.y;
        if (possible > max_so_far) {
          max_so_far = possible;
        }
      }
      return max_so_far;
    }), 0
  ]).range([margins['top'], height - margins['bottom'] - 5]);
  y_axis = d3.svg.axis().scale(stream_y).orient('left');
  chart_group.append('g').attr('class', 'axis').attr('transform', "translate(" + (margins['left'] * 2 - 5) + ", 0)").call(y_axis);
  chart_group.append('text').attr("transform", "rotate(-90)").attr('y', -3).attr('x', -height / 2 - margins['top'] * 1.25).attr('dy', '1em').attr('class', 'stream_y_label').text("Gigawatt-Hours Generated");
  title("Electricity History of " + gon.state_names[to_compare[0]]);
  chart_group.append('text').style('text-anchor', 'middle').attr('y', height - 80).attr('x', width / 2).text("Year");
  area = d3.svg.area().interpolate('cardinal').x(function(d) {
    return stream_x(_max - d.x);
  }).y0(function(d) {
    return stream_y(d.y0);
  }).y1(function(d) {
    return stream_y(d.y0 + d.y);
  });
  chart_group.selectAll('.layer').data(layers).enter().append('path').attr('class', 'layer').attr('d', function(d) {
    return area(d.values);
  }).attr('id', function(d) {
    return "" + d.type + "_layer";
  }).style('fill', function(d) {
    return chart_colors[d.type];
  }).attr('opacity', 0).transition().duration(300).delay(function(d, i) {
    return i * 50;
  }).attr('opacity', 1);
  return chart_group.selectAll('.layer').on('mouseover', function() {
    return highlight_bars([this.id.slice(0, -6)]);
  }).on('mouseleave', unhighlight_bars).on('click', function() {
    return focus_bars([this.id.slice(0, -6)]);
  });
};

stream_data = function() {
  var layers, series, time_series, type;

  time_series = gon.elec_data[to_compare[0]];
  layers = [];
  for (type in time_series) {
    series = time_series[type];
    if (typeof series !== typeof "") {
      layers[layers.length] = {
        "type": "" + type,
        "name": "" + translations[type],
        "values": make_hash_series(series)
      };
    }
  }
  return layers;
};

make_hash_series = function(series) {
  var hashed, i, _i, _ref, _results;

  hashed = [];
  _results = [];
  for (i = _i = 0, _ref = series.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    _results.push(hashed[hashed.length] = {
      "x": i,
      "y": parseFloat(series[i][1])
    });
  }
  return _results;
};
