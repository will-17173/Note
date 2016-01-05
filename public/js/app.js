var app = {
    init: function(){
        this.bindEvent();
        this.getNotes();
        this.initEditor();
    },
    bindEvent: function(){
        $(document).on('click', '.btn-del', function(){
            app.id_to_delete = app.getId(this);
        }).on('click', '#btn_del', function(){
            app.deleteNote();
        }).on('click', '.btn-edit', function(){
            app.isEdit = true;
            app.nowId = app.getId(this);
            var title = $(this).parents('[data-id]').find('.panel-heading').text(),
                content = $(this).parents('[data-id]').find('.note-content').html();
            $('#note_title').val(title);
            app.editor.html(content);
        }).on('click', '#submit', function(){
            app.isEdit ? app.updateNote() : app.newNote();
        }).on('click', '#new_note_btn', function(){
            app.clear();
            app.isEdit = false;
            app.nowId = null;
        });
    },
    initEditor: function(){
        app.editor = $('#editor').wangEditor({
            'menuConfig': [
                ['viewSourceCode'],
                ['bold', 'italic', 'backgroundColor', 'strikethrough'],
                ['insertImage', 'insertCode']
            ]
        });
    },
    getId: function(el){
        return $(el).parents('[data-id]').attr('data-id');
    },
    newNote: function(){
        var title = $('#note_title').val(),
            content = $('#editor').val(),
            t = new Date(),
            date = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate();

        if($.trim(title) == '' && $.trim(content) == ''){
            return;
        }

        $('#submit').prop('disabled', true).text('提交中');

        $.post('/new', {date: date, title: title, content: content}, function(data){
            $('#submit').prop('disabled', false).text('提交');
            if(data.ok && data.n){
                app.clear();
                app.showTip('新建成功');
                $('#new_note').modal('hide');
                app.refreshList();
            }
        })
    },
    getNotes: function(){
        $.ajax({
            url: '/list',
            beforeSend: function(){
                var spinner = new Spinner().spin();
                $('body').append(spinner.el);       
            },
            success: function(data){
                $('.spinner').remove();
                if(data.length){
                    var tmpl = doT.template($('#tmpl_list').text());
                    $('.notes').html(tmpl(data));
                } else{
                    $('.notes').html('<p class="empty">没有笔记</p>');
                }
            }
        })
    },
    deleteNote: function(){
         $.post('/delete', {_id: app.id_to_delete}, function(data){
            if(data.ok && data.n){
                $('#confirm_delete').modal('hide');
                $('[data-id=' + app.id_to_delete + ']').remove();
                app.showTip('删除成功')
            }
         })
    },
    updateNote: function(){
        var title = $('#note_title').val(),
            content = $('#editor').val();
        $.post('/update', {_id: app.nowId, title: title, content: content}, function(data){
            if(data.ok && data.n){
                app.clear();
                app.showTip('更新成功');
                $('#new_note').modal('hide');
                app.refreshList();
            }
        })
    },
    clear: function(){
        $('#note_title').val('');
        app.editor.html('');
    },
    showTip: function(text){
        $('#tip').modal('show').find('.modal-body').text(text);
        setTimeout(function(){
            $('#tip').modal('hide');
        }, 600)
    },
    refreshList: function(){
        $('.notes').html('');
        app.getNotes();
    }
}
app.init();