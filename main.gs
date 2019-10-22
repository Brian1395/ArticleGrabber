/*
Created by Brian Goodell

Issues / Potential Issues:


Cool Things I could implament:
-Image compatibility
*/

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
  return html
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
    comb = comb + text[v] //Comb has all of the text and html formating of the article, next links are removed
  }
  var links = comb.split('</a>')
  var almost_fin = []
  var starts = ""
  var ends = ""
  for (n in links){
    starts = links[n].slice(0,links[n].indexOf('<a')) //All of the text before the link
    var iwnvi = links[n].lastIndexOf('>') + 1 
    ends = links[n].slice(iwnvi) //The text of the link
    almost_fin.push(starts)
    almost_fin.push(ends)
  }
  
  var honey = "" 
  for (i in almost_fin){
    honey = honey + almost_fin[i] //Comb becomes honey, now links are removed, next html bolding will be removed but the text will be saved to be rebolded in doc
  }
  var bolds = honey.split('</strong>')
  var fin = []
  var bolded_text = []
  var bstarts = ""
  var bends = ""
  for (n in bolds){
    bstarts = bolds[n].slice(0,bolds[n].indexOf('<strong')) //All of the text before the bold
    var iwnaebvi = bolds[n].lastIndexOf('>') + 1 
    bends = bolds[n].slice(iwnaebvi) //The bolded text
    fin.push(bstarts)
    fin.push(bends)
    bolded_text.push(bends) //This text will be re-bolded in the final google doc
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

  finstring = finstring.replace(/<!--/g,"")
  finstring = finstring.replace(/-->/g,"")
  var package = []
  package.push(finstring)
  package.push(bolded_text)
  return (package)
}

function extractTitle(content){
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
  return(title)
}



function main(){
  var threads = GmailApp.search('in:inbox subject:"ARTICLE"')
  for(var i = 0; i < threads.length; i++){
    var messages = threads[i].getMessages()
    for(var x = 0; x < threads.length; x++){
      var link = messages[x].getBody()
      if(link[0] == 'h' || link[0] == 'w'){
        threads[i].reply("Unfortuntaly this link was unable to be processed, please check that your email isn't in plain text mode and try again")
        return
      }
      var content = doGet(link)
      if(content == "NA"){
        return
      }
      
      
      var package = processHTML(content);
      var finstring = package[0]
      var bolded_text = package[1]
      
      var title = extractTitle(content);
       
      try{
        var doc = DocumentApp.create('DiscoTest');
        doc.setText(finstring)
        if(title != "UNKNOWN TITLE" && title.length > 3){
          doc.setName(title)
          var text = doc.getBody().editAsText();
          text.insertText(0, title + '\n\n');
          var style = {};
          style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] =
            DocumentApp.HorizontalAlignment.CENTER;
          style[DocumentApp.Attribute.FONT_SIZE] = 20;
          style[DocumentApp.Attribute.BOLD] = true;
          text.setAttributes(0,title.length,style)
        }
        
        //Rebolds specified text 
        var bod = doc.getBody().editAsText()
        for(m in bolded_text) {
          var pos = finstring.indexOf(bolded_text[m]) + title.length + 1
          var endpos = pos + bolded_text[m].length
          bod.setBold(pos, endpos, true)
        }
          
        
        var doc_link = "GO TO DOC: " + doc.getUrl()
        
        var email_raw = threads[i].getMessages()[0].getFrom()
        var email = email_raw.slice(email_raw.indexOf('<') + 1,email_raw.indexOf('>'))
        doc.addEditor(email)
      }
      catch(toomuch){
        var doc_link = "GOOGLE DOC LIMIT ERROR: Too many documents have been created. The count resets tomorrow. \n\n" + toomuch;
      }
        

      
      try{
        threads[i].reply(doc_link + " \n\n RAW ARTICLE: \n" + title + '\n\n' + processURL(link) + '\n\n' + finstring)
      }
      catch(er){
        threads[i].reply(er)
      }
//      doc.saveAndClose()
      threads[i].moveToTrash()
      return;
    }
  }
}
