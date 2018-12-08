var attachments = [
    {"name": "c.jpg", "url":"/zmade/static/attachments/c.jpg"},
    {"name": "fz.png", "url":"/zmade/static/attachments/fz.png"},
    {"name": "go.jpg", "url":"/zmade/static/attachments/go.jpg"},
    {"name": "link.png", "url":"/zmade/static/attachments/link.png"},
    {"name": "linux-c.jpg", "url":"/zmade/static/attachments/linux-c.jpg"},
    {"name": "linux.jpg", "url":"/zmade/static/attachments/linux.jpg"},
    {"name": "lua.png", "url":"/zmade/static/attachments/lua.png"},
    {"name": "me.png", "url":"/zmade/static/attachments/me.png"},
    {"name": "python.png", "url":"/zmade/static/attachments/python.png"},
    {"name": "rust.png", "url":"/zmade/static/attachments/rust.png"},
    {"name": "zlua.png", "url":"/zmade/static/attachments/zlua.png"}
  ];
var languageOverrides = {
  js: 'javascript',
  html: 'xml'
}

function save2webdatabase(code){
  if(isStorage){
    window.localStorage.setItem("zmade-code",code);
  }
}

function checkStorageSupport() {
  if (window.localStorage) {
    return true;
  } else {
    return false;
  }
}

var isStorage = checkStorageSupport();

marked.setOptions({
  highlight: function(code, lang){
    if(languageOverrides[lang]) lang = languageOverrides[lang];
    return hljs.LANGUAGES[lang] ? hljs.highlight(lang, code).value : code;
  }
});

function update(e){
  var val = e.getValue();
  save2webdatabase(val);
  setOutput(val);
}

function setOutput(val){
  var _link_list = [];
  var _sl = val.split("\n");
  var set_num = 0;
  for (var i = 0; i < _sl.length; i++) {
    var _tmps = _sl[i];
    if(set_num == 2){
      _link_list.push(_tmps);
    }else{
      var __tmpss = _tmps.split("");
      if(__tmpss[0] == "@"){
        var __num = 0;
        for (var j = 0; j < __tmpss.length; j++) {
          if(__tmpss[j] == "@"){
            __num++;
          }else{
            break;
          }
        };
        if($.trim(_tmps).length == __num){
          set_num++;
        }
      }
      if(set_num == 0){
        _link_list.push(_tmps);
      }
    }
  }

  var _val = _link_list.join("\n");
  document.getElementById('out').innerHTML = marked(_val);
}

var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
  mode: 'markdown',
  lineNumbers: true,
  matchBrackets: true,
  lineWrapping: true,
  theme: 'default',
  onChange: update
});

document.addEventListener('drop', function(e){
  e.preventDefault();
  e.stopPropagation();

  var theFile = e.dataTransfer.files[0];
  var theReader = new FileReader();
  theReader.onload = function(e){
    editor.setValue(e.target.result);
  };

  theReader.readAsText(theFile);
}, false);


function markdown2data(code){
  var backObj = {};
  var _link_list = [];
  var _sl = code.split("\n");
  var set_num = 0;
  for (var i = 0; i < _sl.length; i++) {
    var _tmps = _sl[i];
    if(set_num == 2){
      _link_list.push(_tmps);
    }else{
      var adddflag = false;
      var __tmpss = _tmps.split("");
      if(__tmpss[0] == "@"){
        var __num = 0;
        for (var j = 0; j < __tmpss.length; j++) {
          if(__tmpss[j] == "@"){
            __num++;
          }else{
            break;
          }
        };
        if($.trim(_tmps).length == __num){
          set_num++;
          adddflag = true;
        }
      }
      if(set_num == 0){
        _link_list.push(_tmps);
      }else{
        if(!adddflag){
          if(__tmpss[0] == "@"){
            __tmpss.shift(0);
            var key_val_list = __tmpss.join("").split(":");
            if(key_val_list.length > 1 && $.trim(key_val_list[0]).length > 0){
              var key_val_key = $.trim(key_val_list[0]);
              key_val_list.shift(0);
              var key_val_val = $.trim(key_val_list.join(":"));
              backObj[key_val_key] = key_val_val;
            }
          }
        }
      }
    }
  }
  backObj["makedown_str"] = _link_list.join("\n");
  backObj["code"] = code;
  return backObj;
}

function jsonpcallback(data){
  alert(data);
  var backObj = JSON.parse(data);
}

function save(){
  var code = editor.getValue();
  var data = markdown2data(code);
  save2webdatabase(code);

  if(data.url){
    var url = data.url;
    delete data.url;
    console.log(data);
    console.log(url);
    $.ajax({
      url: url,
      dataType: 'jsonp',
      jsonp: "jsonpcallback",
      data: data,
      async: false
    });
  }
}

function attachmentDialog(){
  var html = "<ul class='attachments-ul'>";
  for (var i = attachments.length - 1; i >= 0; i--) {
    html += "<li class='copy'><p><a target='_blank' href='"+ attachments[i]['url'] +"'>" + attachments[i]['name'] + ":</a></p><p>" + attachments[i]['url'] + "</p></li>";
  };
  html += "</ul>"
  var d = dialog({
    title: 'Attachments',
    content: html
  });
  d.show();
}

function noTip(ts){
  if(!isStorage){
    return false;
  }
  var notip = window.localStorage.getItem("zmade-notip");
  if(notip){
    if(notip == "false"){
      notip = "true";
    }else{
      notip = "false";
    }
  }else{
    notip = "true";
  }
  window.localStorage.setItem("zmade-notip", notip);
}


function getStorageCodeSetValue(){
  if(!isStorage){
    update(editor);
    editor.focus();
    return false;
  }
  var value = window.localStorage.getItem("zmade-code");
  var notip = window.localStorage.getItem("zmade-notip");
  var saveflag = window.localStorage.getItem("zmade-saveflag");

  if(value && (notip === "false" || notip === null)){
    var d = dialog({
      title: 'Tip',
      content: 'Update code from localStorage?',
      okValue: 'YES',
      ok: function () {
        editor.setValue(value);
        update(editor);
        editor.focus();
        window.localStorage.setItem("zmade-saveflag", "true");
        return true;
      },
      cancelValue: 'NO',
      cancel: function () {
        update(editor);
        editor.focus();
        window.localStorage.setItem("zmade-saveflag", "false");
        return true;
      },
      statusbar: '<label><input type="checkbox" onChange="noTip(this)">不再提醒</label>'
    });
    d.showModal();
  }else{
    if(value){
      console.log(saveflag);
      if(saveflag === "true"){
        console.log("saveflag");
        editor.setValue(value);
        update(editor);
        editor.focus();
      }else{
        update(editor);
        editor.focus();
      }
    }else{
      update(editor);
      editor.focus();
    }
  }
}

document.addEventListener('keydown', function(e){
  if(e.keyCode == 83 && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    save();
    return false;
  }

  if(e.keyCode == 66 && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    attachmentDialog();
    return false;
  }
  if(e.keyCode == 46 && (e.ctrlKey || e.metaKey)){
    if(!isStorage){
      return false;
    }
    window.localStorage.removeItem('zmade-code');
    window.localStorage.removeItem('zmade-saveflag');
    window.localStorage.removeItem('zmade-notip');
    return false;
  }
})

getStorageCodeSetValue();

var GoSquared = { acct: 'GSN-265185-D' };