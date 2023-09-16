import {ref} from 'vue'
import {useStore} from 'vuex'
function hooks(){	
	// login_state
	// openid
	// 拿到收藏夹（只在mounted里调用一次）
	
const store=useStore()
async function request_book_info(book){
				if(store.state.login_state!==1){
					uni.showToast({
						icon:'error',
						title:'清先登录'
					})
					return
				}
				console.log(book.book_name,'book_name')
				uni.showLoading({
					title:'书籍加载中'
				})
				// 当数据存在，那么就跳过
				uni.getStorage({key:book.book_name}).then(()=>{
					uni.navigateTo({
						url:"/pages/current_book_page/current_book_page?book_name="+book.book_name+'&passage_count='+book.passage_count,
						animationType:'slide-in-right'
					})
					uni.hideLoading()
				}).catch(e=>{
					uni.request({
						url:'https://www.mynameisczy.cn:5351/getBookPassage',
						method:'POST',
						data:{
							book_name:book.book_name,
							skip:0,
							count:10
						},
						success(value) {
							uni.hideLoading()
							if(value.data.value.length<=0){
								uni.showToast({
									title:"该书籍暂时还未上架",
									icon:'none'
								})
								return;
							}
							// 将数据进行存储	
							uni.setStorage({
								key:book.book_name,
								data:[{
									index:value.data.value[0].passage_value,
									passage:value.data.value
								}]
							})
							uni.navigateTo({
								url:"/pages/current_book_page/current_book_page?book_name="+book.book_name+'&passage_count='+book.passage_count
							})
						}
					})
				})
			}
			return {request_book_info}
		}
export default hooks