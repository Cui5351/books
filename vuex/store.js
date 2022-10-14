import {createStore} from 'vuex'

const state={
	login_state:0,
	openid:'',
	fav_book:'[]'
}
	// 查看用户是否登录
	uni.getStorage({
		key:'user_info',
	success(e){
		state.login_state=1
		state.openid=e.data.openid
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
						console.log('保存',favbook);
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
						console.log(e,'192');
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
						console.log(e,'e');
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
	}
}

const Store=createStore({
	state,
	mutations,
	actions,
	getters
})
export default Store