/*
Created by Brian Goodell

Issues / Potential Issues:
- Blank Copy documents

To implement:
- Simultaneous processing of multiple links
- Italics <em>


To use this program send an email with a url somewhere in the body and \"ARTICLE\" as the subject. You may add on additional modifiers to the subject line
if you wish, such as:  -b to clear bolding -i to include images in the generated google doc -s to include a generated summary -t to turn on text-only reply 
and not create a google doc  -h to get this help message. \n\n Furthermore if you have a file you would like added to a category-specific google drive 
folder then you can use -c and then your category name, or one of the predefined shortcuts: -d for Discussion -p for plain (the file will be sent back just to
you) Additionally if you have a subcategory (e.g. 1-A for Disco) then you can use -sc and then the sub-cat name and it will be placed within its respective 
folder.
*/

function setUp(){//Creates the folders for the a new year. Should only be run once yearly.
  var disco_folder = "DiscoFiles20-21" //Name of the DiscoFolder
  var num_cats = 2 //This will usually be 2, usually "I" and "II"
  var num_subcats = 10 //These will normally take the form of "A", "B"...
  
  var folders = DriveApp.getFoldersByName(disco_folder) //Gets a list of all folders with the give title
  var folder = folders.next() //Selects the first of the folders (for some reason this needs to be its own line)
  
  for(var i = 1; i <= num_cats; i++){
    for(var n = 0; n < num_subcats; n++){
      var title = i.toString().concat("-").concat(String.fromCharCode(65+n)) //Sets a standard (1-A, 1-B...) folder title
      folder.createFolder(title)
    }
  }
  folder.createFolder("ETC")
}
  
function getInfo(email,category){ //Function to return the proper folder for the article provided
  
  var disco_emails = [] //Emails that should default to the DiscoFolder
  var disco_folder = "DiscoFiles20-21" //Name of the DiscoFolder
  
  
  
  if((disco_emails.indexOf(email) > 0 && category.indexOf("-p") < 0) || (category.indexOf("-d"))){ //Checks if the article should default to Disco
    return disco_folder
  }
  
  if(category.indexOf("-c") > 0){ //Checks for the category param
    var cat = category.substring(category.indexOf("-c"), category.indexOf(" ", category.indexOf("-c") + 2))
    cat.trim()
  }
  switch(cat){
    default:
      return "Category not recognized"
      break
    case "disco":
    case "discussion":
      return disco_folder
      break
  }
}

//General Fuction to return HTML elements by class
function getElementsByClassName(element, classToFind) {  
  var data = []
  var descendants = element.getDescendants()
  descendants.push(element)  
  for(i in descendants) {
    var elt = descendants[i].asElement()
    if(elt != null) {
      var classes = elt.getAttribute('class')
      if(classes != null) {
        classes = classes.getValue()
        if(classes == classToFind) data.push(elt)
        else {
          classes = classes.split(' ')
          for(j in classes) {
            if(classes[j] == classToFind) {
              data.push(elt)
              break
            }
          }
        }
      }
    }
  }
  return data
}

//General Fuction to return HTML elements by tag
function getElementsByTagName(element, tagName) {  
  var data = []
  var descendants = element.getDescendants()  
  for(i in descendants) {
    var elt = descendants[i].asElement()     
    if( elt !=null && elt.getName()== tagName) data.push(elt)      
  }
  return data
}

//Gets the HTML of a given url
function doGet(url_raw) {
  var url = processURL(url_raw)
  try{
    var html = UrlFetchApp.fetch(url).getContentText()
  }
  catch(jasdvkj){
    return("N/A")
  }
  return html
}  

//Processes a given url to make them consistent for later use
function processURL(url_raw){
  var newrl = ""
  
  var pos = url_raw.indexOf("http")
  if(pos > 0){
    var newrl = url_raw.slice(pos)
    if(newrl.indexOf(" ") > 0){
      newrl = newrl.slice(0,newrl.indexOf(" "))
    }
    else if(newrl.indexOf("\"") > 0){
      newrl = newrl.slice(0,newrl.indexOf("\""))
    }
    return (newrl)
  }
  
  var pos = url_raw.indexOf("www")
  if(pos > 0){
    var newrl = url_raw.slice(pos)
    if(newrl.indexOf(" ") > 0){
      newrl = newrl.slice(0,newrl.indexOf(" "))
    }
    return (newrl)
  }
  
  return(newrl)
}

//Gets a summary of the given article from the smmry.com API
function getSummary(url){
  var summary = ""
  var api_key = "" //Put in your own API Key, you stalker
  var qweryURL = "api.smmry.com/&SM_API_KEY="+ api_key + "&SM_URL=" + url
  
  try{
    var response = UrlFetchApp.fetch(qweryURL)
    var json = response.getContentText()
    var data = JSON.parse(json)
  
    summary = data.sm_api_content
  }
  catch(err){
    summary = "A summary could not be generated for this article"
  }
  
  
  return summary
}

// Does most of the actual work. Returns the text of the article while replacing special characters and images
function processHTML(content,addimages,summary,raw_URL){
  var imgcontent = content
  var images = []
  while(imgcontent.indexOf('<img') > 0){ //Some code which I was going to use to add an option to keepimages
    imgcontent = imgcontent.slice(imgcontent.indexOf('<img'))
    var url = imgcontent.slice(imgcontent.indexOf('src="') + 5)
    url = url.slice(0,url.indexOf('"'))
    images.push(url)
  }
    
  
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
    var other = found[x].slice(0,found[x].lastIndexOf('<p')+1)
    if(other.indexOf("<img") > 0 && addimages){
      text.push("IMAGE??!!??RIGHT..HERE") //Inserts image placeholder
    }
    article = found[x].slice(found[x].lastIndexOf('<p')+1)
    article = article.slice(article.indexOf('>')+1)
    var v = (article.match(/</g) || []).length
    var sp = (article.match(/ /g) || []).length
    if(article.length > 1 && article.indexOf(' ') > -1 && article.length/15 < sp && x < found.length - 1){
      if(article != "Supported by"){
        text.push(article)
        text.push('\n\n')
      }
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

  var tags = (finstring.match(/</g) || []).length
  
  for(var i = 0; i < tags; i++){
    var bef = finstring.slice(0,finstring.indexOf("<"))
    var aft = finstring.slice(finstring.indexOf(">")+1)
    //var temp = bef.concat(aft)
    finstring = bef + aft
  }
  
  var test = finstring.indexOf(finstring.slice(0,20)) == finstring.lastIndexOf(finstring.slice(0,20))
  
  
  if(finstring.indexOf(finstring.slice(0,1000)) != finstring.lastIndexOf(finstring.slice(0,1000))){ //Cuts off any werid duplication that might happen during processing
    finstring = finstring.slice(0,finstring.lastIndexOf(finstring.slice(0,100)))
  }
  
  test = finstring.indexOf(finstring.slice(0,20)) == finstring.lastIndexOf(finstring.slice(0,20))
  
  finstring = finstring.replace(/&#039;/g, "'")
  finstring = finstring.replace(/&#8220;/g, '"')
  finstring = finstring.replace(/&#8221;/g, '"')
  
  //Formats the text that will appear in the email
  if(summary){
    var sumry = getSummary(processURL(raw_URL))
    if(sumry != undefined){
      finstring = "GENERATED SUMMARY: \n" + sumry + "\n" + "———————————————————————————————————————————" + "\n\n" + finstring
    }
  }
  
  var package = []
  package.push(finstring)
  package.push(bolded_text)
  package.push(images)
  return (package)
}

//Attempts to find the title of the article
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


//main
function main(){
  var threads = GmailApp.search('in:inbox subject:"ARTICLE"')//Searches for applicable emails
  for(var i = 0; i < threads.length; i++){
    var messages = threads[i].getMessages()
    for(var x = 0; x < threads.length; x++){
      var link = messages[x].getBody()
      var attribs =  messages[x].getSubject().toLowerCase()
      
      var content = doGet(link)
      if(content == "NA"){
        return
      }
      
      var title = extractTitle(content)
      
      var isSubcat =  false
      if(attribs.indexOf("-sc")>0){ 
        isSubcat = true
        var subcat = attribs.substr(attribs.indexOf("-sc") + 3, 5)
        attribs =  attribs.substring(0,attribs.indexOf("-sc")) +  attribs.substring(attribs.indexOf(subcat)+subcat.length)
        subcat = subcat.trim()
        subcat = subcat.toUpperCase()

        subcat = subcat.replace("-","")
        
        title = subcat + " - " + title
      }
      
      
      var bold = false //Bold preservation defaults off, might want to change
      var plural = false //Multiple links defaults to false
      var images = false //For future image transfer implementation
      var text_only = false //Change back if you want to default to not creating a google doc
      var summary = false
      
      if(attribs.indexOf("-b") > 0){
        bold = true
      }
      
      if(attribs.indexOf("-i") > 0){
        images = true
      }
      
      if(attribs.indexOf("-t") > 0){ 
        text_only = !text_only
      }
      
      if(attribs.indexOf("-p") > 0){ 
        text_only = false
      }
      
      if(attribs.indexOf("-s") > 0){
        summary = !summary
      }
      
      if((attribs.indexOf("-h") > 0 && attribs.indexOf("-sc") == 0) || attribs.indexOf("help") > 0){ //Help message
        threads[i].reply("To use this program send an email with a url somewhere in the body and \"ARTICLE\" as the subject. \n You may add on additional modifiers to the subject line if you wish, such as: \n -b to clear bolding \
\n -i to include images in the generated google doc \n -s to include a generated summary \n -t to turn off text-only reply and create a google doc \n -h to get this help message. \n\n Furthermore if you have a file you would like added to a category-specific google drive \
folder then you can use -c and then your category name, or one of the predefined shortcuts: \n -d for Discussion \n\n -p for plain (the doc file will be sent back just to you) \n\n Additionally if you have a subcategory (e.g. 1-A for Disco) \
then you can use -sc and then the sub-cat name and it will be placed within its respective folder.")
      }
      
      var package = processHTML(content,images,summary,link)
      var finstring = package[0]
      var bolded_text = package[1]
      var image_list = package[2]
      
      
      
      var test_string = finstring
      while (finstring != finstring.replace("IMAGE??!!??RIGHT..HERE", "")){ //Horribly inefficient, I know, but I think index wasn't working on this or something. (This is a post-code comment - I'm trying to understand it too)
        finstring = finstring.replace("IMAGE??!!??RIGHT..HERE", "")
      }
      
      //Turns the article into a google doc
      if(!text_only){ 
        try{
          var doc = DocumentApp.create('DiscoTest')
          doc.setText(finstring)
          if(title != "UNKNOWN TITLE" && title.length > 3){
            doc.setName(title)
            var text = doc.getBody().editAsText()
            text.insertText(0, title + '\n\n')
            var style = {}
            style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] =
              DocumentApp.HorizontalAlignment.CENTER
            style[DocumentApp.Attribute.FONT_SIZE] = 20
            style[DocumentApp.Attribute.BOLD] = true
            text.setAttributes(0,title.length,style)
          }
          
          //Rebolds specified text 
          if(bold){
            var bod = doc.getBody().editAsText()
            for(m in bolded_text) {
              var pos = finstring.indexOf(bolded_text[m]) + title.length + 1
              var endpos = pos + bolded_text[m].length
              bod.setBold(pos, endpos, true)
            }
          }
          
          //Would substitute images if I had gotten it working
          var plchold = -1
          if(images){
            var goiaub
            for(goiaub in image_list){
              var image = image_list.shift()
              var blob = UrlFetchApp.fetch(image).getBlob()
              
              plchold = test_string.indexOf("IMAGE??!!??RIGHT..HERE", plchold)
              //          var elehold = doc.getBody().findText("IMAGE??!!??RIGHT..HERE")
              //          var poshold = doc.newPosition(elehold, 0)
              //          doc.setCursor(poshold)
              //          var curses = doc.getCursor()
              //          curses.insertInlineImage(blob)
              //doc.getBody().insertImage(plchold, blob)
              var enterstring = test_string.slice(0,plchold)
              var po = 1
              var enters = 0
              while(po > -1){
                enters += 1
                po = enterstring.indexOf("\n\n",po+4)
              }
              var doc_img = doc.getBody().insertImage(enters, blob)
              var doc_img_attribs = doc_img.getAttributes()
              doc_img.setWidth(doc_img_attribs['WIDTH']/5)
              doc_img.setHeight(doc_img_attribs['HEIGHT']/5)
              finstring = finstring.replace("IMAGE??!!??RIGHT..HERE", "")
            }
          }
          //var cursor = doc.getCursor()
          //cursor.insertInlineImage(image)
          
          
          var doc_link = "GO TO DOC: " + doc.getUrl()
          
          var email_raw = threads[i].getMessages()[0].getFrom()
          var email = email_raw.slice(email_raw.indexOf('<') + 1,email_raw.indexOf('>'))
          doc.addViewer(email)
          
          var file = DriveApp.getFileById(doc.getId())
          var folder_name = getInfo(email,attribs)
          var folders = DriveApp.getFoldersByName(folder_name)
          var folder = folders.next()
          if(isSubcat){ //Sub Category Stuff (1-A, 1-B...)
            var afsirb = folder.getFolders()
            var ahfbeiab = []
            var subf, subfn = ""
            while(afsirb.hasNext()){
              subf = afsirb.next()
              subfn = subf.getName()
              subfn = subfn.replace("-","")
              if(subfn == subcat){
                folder = subf
              }
            }
           
          }
          doc.saveAndClose()
          var newfile = file.makeCopy(file.getName(),folder)
          doc_link = newfile.getUrl()
          DriveApp.removeFile(file)
          
        }
        catch(toomuch){
          var doc_link = toomuch
        }
      }      
      
      
      try{
        threads[i].reply(doc_link + " \n\n RAW ARTICLE: \n" + title + '\n\n' + processURL(link) + '\n\n' + finstring)
      }
      catch(er){
        var ertest = er.message
        threads[i].reply(ertest)
      }
//      doc.saveAndClose()
      threads[i].moveToTrash()
      return
    }
  }
}
