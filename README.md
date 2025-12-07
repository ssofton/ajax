Use this CDN for submitting html form
< form id="form_id"><br>
    < input type="-text" name="action" value="form1"><br>
    < input type="-text" name="xyz" value="xyz"><br>
    < button type="submit" class="btn btn-success">Submit< /button>
< /form>

Use this CDN to send array data to the backend, even when you're not using a form. 
<button onclick="sendData({action: 'myAction'})">Click</button>
<? php $action = 'action.php' ? >
<script>
   var actionPath = '<?= $action ?>';
   function sendData(arr) {
       callAjax(arr, 'routes.php');
   }
</script>
