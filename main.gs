function getElementsByClassName(element, classToFind) {  
  var data = [];
  var descendants = element.getDescendants();
  descendants.push(element);  
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if(elt != null) {
      var classes = elt.getAttribute('class');
      if(classes != null) {
        classes = classes.getValue();
        if(classes == classToFind) data.push(elt);
        else {
          classes = classes.split(' ');
          for(j in classes) {
            if(classes[j] == classToFind) {
              data.push(elt);
              break;
            }
          }
        }
      }
    }
  }
  return data;
}


function getElementsByTagName(element, tagName) {  
  var data = [];
  var descendants = element.getDescendants();  
  for(i in descendants) {
    var elt = descendants[i].asElement();     
    if( elt !=null && elt.getName()== tagName) data.push(elt);      
  }
  return data;
}

function doGet(url_raw) {
  var url = processURL(url_raw);
  try{
    var html = UrlFetchApp.fetch(url).getContentText();
  }
  catch(jasdvkj){
    return("N/A")
  }
  return html//HtmlService.createHtmlOutput(output);
}  

function processURL(url_raw){
  var s = url_raw.search("href=");
  var st = url_raw.slice(s+6,s+14);
  st = ">" + st
  var e = url_raw.search(st);
  var b = 1;
  var url = url_raw.slice(s+6,(e/1)-b);
  return(url)
}

function processHTML(content){
  if(content.indexOf('<body>') > -1){
    var body = content.slice(content.indexOf('<body>'),content.indexOf('</body>'))
    }
  else{
    var body = content.slice(content.indexOf('<body'),content.indexOf('</body>'))
    }
  var found = body.split('</p>')
  var text = []
  var article = ""
  for (x in found){
    article = found[x].slice(found[x].lastIndexOf('<p')+1)
    article = article.slice(article.indexOf('>')+1)
    var v = (article.match(/</g) || []).length
    var sp = (article.match(/ /g) || []).length
    if(article.length > 1 && article.indexOf(' ') > -1 && article.length/15 < sp && x < found.length - 1){
      text.push(article)
      text.push('\n\n')
    }
  }


  var comb = ""
  for (v in text){
    comb = comb + text[v]
  }
  var links = comb.split('</a>')
  var fin = []
  var starts = ""
  var ends = ""
  for (n in links){
    starts = links[n].slice(0,links[n].indexOf('<a'))
    var iwnvi = links[n].lastIndexOf('>') + 1
    ends = links[n].slice(iwnvi)
    fin.push(starts)
    fin.push(ends)
  }


  var finstring = ""
  for (m in fin){
    finstring = finstring + fin[m]
  }

  finstring = finstring.replace(/<em>/g,"")
  while(finstring.indexOf("</em>")>-1){
    finstring = finstring.replace("</em>","")
  }

  finstring = finstring.replace(/<b>/g,"")
  while(finstring.indexOf("</b>")>-1){
    finstring = finstring.replace("</b>","")
  }

  finstring = finstring.replace(/<strong>/g,"")
  while(finstring.indexOf("</strong>")>-1){
    finstring = finstring.replace("</strong>","")
  }

  finstring = finstring.replace(/<!--/g,"")
  finstring = finstring.replace(/-->/g,"")
  return (finstring)
}

function getTargetEmails(){
  var threads = GmailApp.search('in:inbox subject:"ARTICLE"')
  
  for(i = 0; i < threads.length; i++){
    var messages = threads[i].getMessages()
    for(x = 0; x < threads.length; x++){
      var link = messages[x].getBody()
      if(link[0] == 'h' || link[0] == 'w'){
        threads[i].reply("Unfortuntaly this link was unable to be processed, please check that your email isn't in plain text mode and try again")
        return
      }
      var content = doGet(link)
      if(content == "NA"){
        return
      }
      
      
      var finstring = processHTML(content)
      
//Finds Title of Article      
      var title = "UNKNOWN TITLE"
      var titlepos = content.indexOf("</h1>") 
      if(titlepos  > -1){
        var step1 = content.slice(0,titlepos)
        var weuaboiefb = step1.lastIndexOf(">")-11
        title = step1.slice(weuaboiefb)
      }
      
      titlepos = content.indexOf("<meta name=\"title\" content=\"") 
      if(titlepos  > -1){
        step1 = content.slice(titlepos + 28)
        weuaboiefb = step1.indexOf("\"")
        title = step1.slice(0,weuaboiefb)
      }
      
      titlepos = content.indexOf("</title>") 
      if(titlepos  > -1){
        step1 = content.slice(0,titlepos)
        weuaboiefb = step1.lastIndexOf(">")+1
        title = step1.slice(weuaboiefb)
      }
      
      
      var doc = DocumentApp.create('DiscoTest');
      if(title != "UNKNOWN TITLE" && title.length > 3){
        doc.setName(title)
      }
      doc.setText(finstring)
      try{
        threads[i].reply("GO TO DOC: " + doc.getUrl() + " \n\n RAW ARTICLE: \n" + title + '\n\n' + processURL(link) + '\n\n' + finstring)
      }
      catch(er){
        threads[i].reply(er)
      }
      threads[i].moveToTrash()
      return;
    }
  }
}
