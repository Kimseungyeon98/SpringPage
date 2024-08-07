$(function(){
	let rowCount = 10;
	let currentPage;
	let count;
	
	/*===================
		댓글 목록
	===================*/
	//댓글 목록
	function selectList(pageNum){
		currentPage = pageNum;
		
		//서버와 통신
		$.ajax({
			url:'listReply',
			type:'get',
			data:{board_num:$('#board_num').val(),pageNum:pageNum,rowCount:rowCount},
			dataType:'json',
			beforeSend:function(){
				$('#loading').show();//로딩 이미지 표시
			},
			complete:function(){
				$('#loading').hide();//로딩 이미지 숨김
			},
			success:function(param){
				count = param.count;
				if(pageNum == 1){
					$('#output').empty();
				}
				//댓글수 읽어 오기
				displayReplyCount(param.count);
				//댓글 목록 작업
				$(param.list).each(function(index,item){
					let output = '<div class="item">';
					output += '<ul class="detail-info">';
					output += '<li>';
					output += '<img src="../member/viewProfile?mem_num=' + item.mem_num + '" width="40" height="40" class="my-photo">';
					output += '</li>';
					output += '<li>';
					if(item.nick_name){
						output += item.nick_name+'<br>';
					}else{
						output += item.id+'<br>';
					}
					if(item.re_mdate){
						output += '<span class="modify-date">최근 수정일 : '+item.re_mdate+'</span>';
					}else{
						output += '<span class="modify-date">등록일 : '+item.re_date+'</span>';
					}
					output += '</li>';
					output += '</ul>';
					output += '<div class="sub-item">';
					output += '<p>'+item.re_content.replace(/\r\n/g,'<br>')+'</p>';
					//좋아요 시작
					
					if(item.click_num=0 || param.user_num!=item.click_num){
						output += '<img class="output_fav" src="../images/heart01.png" data-num="'+item.re_num+'"><sapn>'+item.refav_cnt+'</span>';
					}
					
					
					//좋아요 끝
					if(param.user_num==item.mem_num){
						//로그인한 회원번호와 댓글 작성자 회원번호가 일치
						output += ' <input type="button" data-num="'+item.re_num+'" value="수정" class="modify-btn">';
						output += ' <input type="button" data-num="'+item.re_num+'" value="삭제" class="delete-btn">';
					}
					//답글 시작
					if(param.user_num){
						output += ' <input type="button" data-num="'+item.re_num+'" data-parent="0" data-depth="0" value="답글 작성" class="response-btn">'	
					}
					if(item.resp_cnt>0){
						output += '<div><input type="button" data-status="0" data-num="'+item.re_num+'" value="▲ 답글'+item.resp_cnt+'" class="response-btn"></div>'
					} else{
						output += '<div><input type="button" data-num="'+item.re_num+'" value="▲ 답글 0" class="response-btn" style="display:none;"></div>'
					}
					//답글 끝
					output += '</div>';
					output += '</div>';
					
					//문서 객체에 output 추가
					$('#output').append(output);
				});//end of each
				//페이지 버튼 처리
				if(currentPage>=Math.ceil(count/rowCount)){
					//다음 페이지가 없음
					$('.paging-button').hide();
				}else{
					//다음 페이지 존재
					$('.paging-button').show();
				}
			},
			error:function(){
				alert('네트워크 오류 발생!!');
			}
		});
	}
	
	//다음 댓글 보기 버튼 클릭시 데이터 추가
	$('.paging-button input').click(function(){
		selectList(currentPage + 1);
	});
	
	/*===================
		댓글 등록
	===================*/
	//댓글 등록
	$('#re_form').submit(function(event){
		if($('#re_content').val().trim()==''){
			alert('내용을 입력하세요');
			$('#re_content').val('').focus();
			return false;
		}
		let form_data = $(this).serialize();
		console.log(form_data);
		//서버와 통신
		$.ajax({
			url:'writeReply',
			type:'post',
			data:form_data,
			dataType:'json',
			success:function(param){
				if(param.result == 'logout'){
					alert('로그인 해야 작성 가능합니다.');
				}else if(param.result == 'success'){
					//폼 초기화
					initForm();
					//댓글 작성시 성공하면 새로 삽입한 글을 포함해서 첫번째 페이지의 게시글들을 다시 호출
					selectList(1);
					
				}else{
					alert('댓글 등록 오류 발생');
				}
			},
			error:function(){
				alert('네트워크 오류 발생');
			}
		});
		//기본 이벤트 제거
		event.preventDefault();
	});
	//댓글 작성 폼 초기화
	function initForm(){
		$('textarea').val('');
		$('#re_first .letter-count').text('300/300');
	}
	
	/*===================
		댓글 수정
	===================*/
	//댓글 수정 버튼 클릭시 수정폼 노출
	$(document).on('click','.modify-btn',function(){
		//댓글 번호
		var re_num = $(this).attr('data-num');
		//댓글 내용
																	// g: 지정 문자열 모두, i: 대소문자 무시
		var re_content = $(this).parent().find('p').html().replace('/<br>/gi','\r\n');
		
		//댓글 수정폼 UI
		var modifyUI = '<form id="mre_form">';
		modifyUI += '<input type="hidden" name="re_num" id="re_num" value="' + re_num + '">';
		modifyUI += '<textarea row="3" cols="50" name="re_content" id="mre_content" class="rep-content">'+re_content+'</textarea>';
		modifyUI += '<div id="mre_first"><span class="letter-count">300/300</span></div>';
		modifyUI += '<div id="mre_second" class="align-right">';
		modifyUI += ' <input type="submit" value="수정">';
		modifyUI += ' <input type="button" value="취소" class="re-reset">';
		modifyUI += '</div>';
		modifyUI += '<hr width="96%">';
		modifyUI += '</form>';
		
		//답글이 있는 경우 답글 초기화
		
		
		//답글이 있는 경우 답글 초기화
		
		
		//이전에 이미 수정하는 댓글이 있을 경우 수정 버튼을 클릭하면
		//숨김 sub-item을 환원시키고 수정폼을 초기화함
		initModifyForm();
		//지금 클릭해서 수정하고자 하는 데이터는 감추기
		//(수정 버튼을 감싸고 있는 div)
		$(this).parent().hide();
		
		//수정폼을 수정하고자 하는 데이터가 있는 div에 노출
		$(this).parents('.item').append(modifyUI);
		
		//입력한 글자수 셋팅
		var inputLength = $('#mre_content').val().length;
		var remain = 300 - inputLength;
		remain += '/300';
		
		//문서 객체에 반영
		$('#mre_first .letter-count').text(remain);
	});
	//수정폼에서 취소 버튼 클릭시 수정폼 초기화
	$(document).on('click','.re-reset',function(){
		initModifyForm();
	});
	
	//댓글 수정폼 초기화
	function initModifyForm(){
		$('.sub-item').show();
		$('#mre_form').remove();
	}
	
	//댓글 수정
	$(document).on('submit','#mre_form',function(event){
		if($('#mre_content').val().trim()==''){
			alert('내용을 입력하세요!');
			$('#mre_content').val().focus();
			return false;
		}
		//폼에 입력한 데이터 반환
		let form_data = $(this).serialize();
		//서버와 통신
		$.ajax({
			url:'updateReply',
			type:'post',
			data:form_data,
			dataType:'json',
			success:function(param){
				if(param.result=="logout"){
					alert('로그인해야 수정할 수 있습니다.');
				} else if(param.result=='success'){
					//다시 db로 돌아가서 리스트를 조회하는 것은 불필요한 작업이기 때문에 댓글 작성 시 html을 삽입해준다.
					$('#mre_form').parent().find('p').html($('#mre_content').val().replace(/</g,'&lt;')
																				 .replace(/>/g,'&gt;')
																				 .replace(/\r\n/g,'<br>')
																				 .replace(/\r/g,'<br>')
																				 .replace(/\n/g,'<br>'));
					//최근 수정일 처리
					$('#mre_form').parent().find('.modify-date').text('최근 수정일 : 5초미만');
					
					//수정폼 초기화
					initModifyForm();
					
				} else if(param.result=='wrongAccess'){
					alert('타인의 글은 수정할 수 없습니다.');
				} else {
					alert('댓글 수정 오류 발생');
				}
			},
			errors:function(){
				alert('네트워크 오류 발생');
			}
		});
		//기본 이벤트 제거
		event.preventDefault();
	});
	
	/*======================
		댓글(답글) 등록, 수정 공통
	========================*/
	//textarea 에 내용 입력시 글자수 체크
	$(document).on('keyup','textarea',function(){
		//입력한 글자수 구하기
		let inputLength = $(this).val().length;
		if(inputLength > 300){//300자를 넘어선 경우
			$(this).val($(this).val().substring(0,300));
		}else{//300자 이하인 경우
			//남은 글자수 구하기
			let remain = 300 - inputLength;
			remain += '/300';
			if($(this).attr('id')=='re_content'){
				//댓글 등록 폼
				$('#re_first .letter-count').text(remain);
			}else if($(this).attr('id')=='mre_content'){
				//댓글 수정 폼 글자수
				$('#mre_first .letter-count').text(remain);
			}else if($(this).attr('id')=='resp_content'){
				//답글 등록 폼 글자수
				$('#resp_first .letter-count').text(remain);
			}else{
				//답글 수정 폼 글자수
				$('#mresp_first .letter-count').text(remain);
			}
		}
	});
	
	/*===================
		댓글 삭제
	===================*/
	$(document).on('click','.delete-btn',function(){
		//댓글 번호
		let re_num = $(this).attr('data-num');
		//서버와 통신
		$.ajax({
			url:'deleteReply',
			type:'post',
			data:{re_num:re_num},
			dataType:'json',
			success:function(){
				if(param.result=='logout'){
					alert('로그인해야 삭제할 수 있습니다.');
				} else if(param.result=='success'){
					alert('삭제 완료!');
					selectList(1);
				} else if (param.result=='wrongAccess'){
					alert('타인의 글은 삭제할 수 없습니다.');
				} else {
					alert('댓글 삭제 오류 발생');
				}
			},
			errors:function(){
				alert('네트워크 오류 발생');
			}
		});
	});
	/*===================
		댓글수 표시
	===================*/
	function displayReplyCount(count){
		let output;
		if(count>0){
			output = '댓글수(' + count + ')';
		} else {
			output = '댓글수(0)';
		}
		//문석 객체에 추가
		$('#output_rcount').text(output);
	}
	
	/*===================
		댓글 좋아요 목록
	===================*/
	
	/*===================
		댓글 좋아요 등록/삭제
	===================*/
	$(document).on('click','.output_rfav',function(){
		let heart = $(this);
		//서버와 통신
		$.ajax({
			url:'writeReFav',
			type:'post',
			data:{re_num:heart.attr('data-num')},
			dataType:'json',
			success:function(param){
				if(param.result == 'logout'){
					alert('로그인 후 좋아요를 눌러주세요.');
				}else if(param.result == 'success'){
					displayFav(param,heart);
				}else{
					alert('댓글 좋아요 등록/삭제 오류 발생');
				}
			},
			error:function(){
				alert('네트워크 오류 발생');
			}
		});
	});
	
	/*===================
		댓글 좋아요 표시
	===================*/
	function displayFav(param,heart){
		let output;
		if(param.status == 'noFav'){
			output = '../images/heart01.png';
		}else{
			output = '../images/heart02.png';
		}
		//문서 객체에 추가
		heart.attr('src',output);
		heart.parent().find('.output_rfcount').text(param.count);
	};
	
	/*===================
		답글 등록
	===================*/
	//답글 작성 버튼 클릭시 답글 작성 폼 노출
	$(document).on('click','.response-btn,.response2-btn',function(){
		//모든 폼 초기화
		initResponseForm();
		//클릭하면 모든 답글 작성 버튼을 노출시키고 클릭한 답글 작성 버튼만 숨기기
		$(this).hide();
		
		//댓글 번호
		let re_num = $(this).attr('data-num');
		//부모 글 번호
		let te_parent_num = $(this).attr('data-parent');
		//깊이
		let te_depth = $(this).attr('data-depth');
		console.log(te_parent_num + ',' + te_depth);
		
		//답글 작성 폼 UI
		var responseUI = '<form id="resp_form">';
		responseUI += '<input type="hidden" name="re_num" id="re_num" value="' + re_num + '">';
		responseUI += '<input type="hidden" name="te_parent_num" value="' + te_parent_num + '">';
		responseUI += '<input type="hidden" name="te_depth"value="' + te_depth + '">';
		responseUI += '<textarea row="3" cols="50" name="te_content" id="resp_content" class="rep-content"></textarea>';
		responseUI += '<div id="resp_first"><span class="letter-count">300/300</span></div>';
		responseUI += '<div id="resp_second" class="align-right">';
		responseUI += ' <input type="submit" value="답글 작성">';
		responseUI += ' <input type="button" value="취소" class="resp-reset">';
		responseUI += '</div>';
		responseUI += '<hr width="96%">';
		responseUI += '</form>';
		
		//답글 작성폼을 답글을 작성하고자하는 데이터가 있는 div에 노출
		$(this).after(responseUI);
	});	
	//답글에서 취소 버튼 클릭시 답글 폼 초기화
	$(document).on('click','.resp-reset',function(){
		initResponseForm();
	});
	//답글 작성 폼 초기화
	function initResponseForm(){
		$('.response-btn,.response2-btn').show();
		$('#resp_form').remove();
	}
	//답글 등록
	$(document).on('submit','#resp_form',function(event){
		let resp_form = $(this);
		
		if($('#resp_content').val().trim()==''){
			alert('내용을 입력하세요!');
			$('#resp_content').val('').focus();
			return false;
		}
		
		//폼에 입력한 데이터 반환
		let form_data = $(this).serialize();
		
		//댓글 번호
		let re_num = $(this).find('#resp_num').val();
		
		//서버와 통신
		$.ajax({
			url:'writeResponse',
			type:'post',
			data:form_data,
			dataType:'json',
			success:function(param){
				if(param.result == 'logout'){
					alert('로그인해야 답글을 작성할 수 있습니다.');
				} else if(param.result == 'success'){
					//답글목록호출
					/*getListResponse(re_num,resp_form.parents('.item'));*/
					initResponseForm();
				} else {
					alert('답글 작성 오류 발생');
				}
			},
			error:function(){
				alert('네트워크 오류 발생');
			}
		})
		
		//기본 이벤트 제거
		event.preventDefault();
	});
	
	/*===================
		답글 목록
	===================*/
	
	/*===================
		답글 수정
	===================*/
	
	/*===================
		답글 삭제
	===================*/
	
	/*===================
		초기 데이터 호출
	===================*/
	selectList(1);
	
});