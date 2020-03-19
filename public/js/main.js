$(document).ready(function(){
   $('.delete-menus').on('click', function(){
       var id = $(this).data('id');
       var url = '/delete/'+id;
       if(confirm('Delete Recipe?')){
           $.ajax({
               url: url,
               type: 'DELETE',
               success: function(result){
                   console.log('Deleting Recipe...');
                   window.location.href='/';

               },
               error: function(){
                   console.log(err);
               }
           });
       }
   });
});



$('.edit-menus').on('click', function(){
    $('#edit-form-name').val($(this).data('name'));
    $('#edit-form-ingredients').val($(this).data('ingredients'));
    $('#edit-form-directions').val($(this).data('directions'));
    $('#edit-form-id').val($(this).data('id'));
    
})




function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }