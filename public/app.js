$('#scrape').on('click', function (event) {
    event.preventDefault();
    $.ajax({
        url: '/scrape',
        type: 'GET',
    }).done(function(response) {
        // $('#numArticles').text(response.count)
        // $('#modal').modal({show: 'true'});
        // console.log(response.count)
        // console.log("scrape successful!")
        window.location.href = "/";
    })
})

// On click to save article
$(".save").on("click", function() {
    $(this).parent().remove();
    var articleId = $(this).attr("data-id");
    $(".article").filter("[data-id='" + articleId +"']").remove();
    $.ajax({
        method: "POST",
        url: "/save/" + articleId
    }).done(function(data) {
        console.log("saved article")
    })
})

// Open note modal and populate notes
$(".addNote").on("click", function() {
    console.log("clicked")
    $("#notes").empty();
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/grabNotes/" + thisId
    }).then(function(data){
        console.log("hit");
        console.log(data);
          $("#notes").append("<h3>" + data.title + "</h3>");
          $("#notes").append("<p id='notesbody'></p>");
          $("#notes").append("<div class='form-group'><label for='note-input'>Enter Note Here: </label>textarea class='form-control' id='note-input' rows='4' placeholder='New Note></div>");
          $("#notes").append("<button class='btn btn-default' data-id='" + data._id + "' id='savenote'>Save Note</button>");
          if (data.note) {
            $("#notesbody").text(data.note.body);
          }
      });
      $('#noteModal').modal();
  });

$(".newNote").on("click", function() {
    console.log("clicked")
    var noteId = $(this).attr("data-id");
    if (!$("#noteText" + noteId).val()) {
        alert("Please enter note")
    } else {
        $.ajax({
            method: "POST",
            url: "/newNote/" + noteId,
            data: {
                text: $("#noteText" + noteId).val()
            }
        }).done(function(data) {
            console.log("note saved!")
            console.log(data);
            $("#noteText" + noteId).val("")
            window.location = "/saved"
        })
    }
})

// Remove saved note
$(".remove").on("click", function() {
    console.log("clicked")
    var articleId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/unsave/" + articleId
    }).done(function(data) {
        console.log("removed")
    });
});
