import {createStore} from 'vuex'
const state={
	login_state:0,
	openid:'',
	fav_book:'[]',
	name:'',
	gender:'暂无',
	portraitUrl:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
	score:'0',
	telephone:'无',
	author_answer:'',
	data_provide_answer:'',
	introduction:''
}
	// 查看用户是否登录
	uni.getStorage({
		key:'user_info',
	success(e){
		state.login_state=1
		state.openid=e.data.openid
		state.name=e.data.name
		state.gender=e.data.gender
		state.portraitUrl=e.data.portraitUrl
		state.score=e.data.score
		state.introduction=e.data.introduction
		uni.getStorage({
			key:'answer',
			success(e) {
				state.author_answer=e.data.author_answer
				state.data_provide_answer=e.data.data_provide_answer
			}
		})
	},fail(){
		state.login_state=0
	}})
		
const mutations={
	FAV_BOOK(state,e){
		uni.request({
			url:'https://www.mynameisczy.asia:5351/setBookshelf',
			method:'POST',
			data:{
				openid:state.openid,
				book_name:e.book_name
			},fail(e) {
				uni.showToast({
					icon:'error',
					title:'请重新再进行尝试'
				})
			},success(value) {
				let favbook=JSON.parse(state.fav_book)
				if(favbook.length<=0){
					favbook.push(e.book_name)
					if(e.fav==false){
						e.fav=true
					}
					state.fav_book=JSON.stringify(favbook)
					return
				}
				favbook.forEach((item,index)=>{
					if(item==e.book_name){
						favbook.splice(index,1)
						state.fav_book=JSON.stringify(favbook)
					}
					if(index==favbook.length-1){
						favbook.push(e.book_name)
						state.fav_book=JSON.stringify(favbook)
						return;
					}
				})
				// 如果e.book_name还在fav_book里存在，那么就将e.book_name在里面删除
				e.fav=!e.fav
			}
		})
	},
	GETBOOKSHELF(state){
				uni.request({
					url:'https://www.mynameisczy.asia:5351/getBookshelf',
					method:'POST',
					data:{openid:state.openid},
					success(e) {
						if(e.data.state==0){
							uni.showToast({
								icon:'error',
								title:"请重新登录后再尝试"
							})
							return
						}
						state.fav_book=JSON.stringify(e.data.data)
					},
					fail(e) {
						uni.showToast({
							icon:'error',
							title:"请重新登录后再尝试"
						})
					}
				})
	},
	SETLOGINSTATE(state,value){
		if(value==0){
			state.openid=''
			state.fav_book='[]'
			state.name=''
			state.portraitUrl="https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
			state.telephone='暂无'
			state.score='0'
			state.gender='未知'
			state.introduction=''
		}
		state.login_state=value
	}
}

const actions={
	// 设置
	fav_book({commit,state},{book}){
		commit('FAV_BOOK',arguments[1])
	},
	// 获取
	getBookshelf({commit}){
		commit('GETBOOKSHELF')
	},
	setLoginState({commit,state},value){
		if(value==1){
			// 通过getStorage拿到openid
			const info=uni.getStorageSync('user_info')
			if(info.hasOwnProperty('openid'))
				state.openid=info.openid
			commit("GETBOOKSHELF")
		}
		commit('SETLOGINSTATE',value)
	}
}

const getters={
	fav_book(state){
		return JSON.parse(state.fav_book)
	},
	login_state(state){
		return state.login_state
	},
	user_name(state){
		return state.name
	},
	user_avatar(state){
		return state.portraitUrl
	},
	user_gender(state){
		return state.gender
	},
	user_score(state){
		return state.score
	},
	user_telephone(state){
		return state.telephone
	},
	user_openid(state){
		return state.openid
	},
	author_answer(state){
		return state.author_answer
	},
	data_provide_answer(state){
		return state.data_provide_answer
	},
	user_introduction(state){
		return state.introduction
	}
}

const Store=createStore({
	state,
	mutations,
	actions,
	getters
})
export default Store