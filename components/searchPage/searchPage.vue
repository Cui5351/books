<template>
		<search_navigator :head_height="head_height" :search_text='search_text' :default_search_text='default_search_text' :search_state='search_state' :clear_text='clear_text' :search2='search2'></search_navigator>
	<view class="container" :style="{marginTop:(Number(head_height)*2+20)+'px'}">
		<view class="container2">
			<view class="history" v-if="search_state" :style="{height:(info.windowHeight/2)*0.5+'px'}">
				<view class="title"  :style="{maxHeight:head_height*0.8+'px',minHeight:head_height*0.8+'px'}">
					<view>热门推荐</view>
					<uni-icons type="refreshempty" size="25" @click="getHotBook(5,hot)"></uni-icons>
				</view>
				<view class="search_record">
					<view v-for="(item,index) in hot" :key="index" @click="search2(item.book_name)">
						{{item.book_name}}
					</view>
					<!-- 这里是网络请求得到的热门小说（网络请求中途，使用一个状态码，来对子组件的加载设置search_navigator） -->
				</view>
			</view>
		</view>
		
		<search_history v-if="search_state"
						:head_height="head_height"
						:default_search_text="default_search_text"
						:info="info"
						:clear_search_record="clear_search_record"
						:search_record="search_record"
						:search="search2"></search_history>
		<book_searchPage :navigation_hei='head_height' :load_state='load_state' v-show="!search_state" :tolower='search' :skip="skip" :count="count" :book_wh="book_wh" :store_infos="store_infos"></book_searchPage>
	</view>
</template>

<script>
	import {useStore} from 'vuex'
	import hooks from '../store/hooks.js'
	import search_history from '../book_search/search_history.vue'
	import {ref,reactive,watch,computed} from 'vue'
	import search_navigator from '../book_search/search_navigator.vue'
	import book_searchPage from '../book_search/book_searchPage.vue'
	export default {
		onLoad(val) {
			this.head_height=val.head_height
			this.book_wh=val.book_wh
			this.default_search_text=val.default_search_text
		},
		components:{
			search_navigator,search_history,book_searchPage
		},
		mounted() {
			uni.current_this4=this
			this.getHotBook(5,this.hot)
			uni.getStorage({
				key:'search_record',
				success(val) {
					uni.current_this4.search_record.push(...val.data)
				}
			})
		},
		setup() {
			let load_state=reactive({
				state:0
			})
			let book_info=reactive([])
			let search_state=ref(true)
			let store_infos=reactive([])
			let hot=reactive([])
			let search_text=reactive({t:''})
			let book_wh=ref(0)
			let count=ref(6)
			let skip=ref(0)
			let head_height=ref(0)
			let default_search_text=ref('')
			let search_record=reactive([]);
			let info=reactive(uni.getSystemInfoSync())
			let store=useStore()
			let user_bookshelf=computed(()=>store.getters.fav_book)
			
			watch(()=>search_text.t,function(n,o){
				if(n.length<=0){
					search_state.value=true
					skip.value=0
					count.value=6
				}
			})
			function getHotBook(count,item){
				uni.showLoading({
					title:'数据加载中',
				mask:true
				})
				uni.request({
					url:'https://www.mynameisczy.cn:5351/getRandomBook',
					method:'POST',
					data:{
						count:count
					},success(val) {
						let n=item.length
						for(let i=0;i<n;i++)
							item.pop()
						item.push(...val.data.value)
						uni.hideLoading()
					},fail(err) {
					}
				})
			}
			
			const {request_book_info}=hooks()
			
			function search2(t){
				skip.value=0
				count.value=6
				uni.showLoading({
					title: '书籍加载中',
				mask:true
				})
				let text=search_text.t.length?search_text.t:default_search_text.value
				if(typeof t === 'string')
					text=t
				search_record.push(text)
				if(search_record.length>6)
					search_record.shift()
				search_text.t=text
				uni.request({
					url:'https://www.mynameisczy.cn:5351/SearchBookInfo',
					method:"POST",
					data:{
						book_name:text,
						skip:skip.value,count:count.value
					},success(value) {
						value.data.value.forEach(item=>{
							item.fav=false
						})
						// 如果找到相同的那么设置为true
						value.data.value=value.data.value.map(item=>{
							uni.current_this4.user_bookshelf.forEach(item2=>{
								if(item.book_name==item2){
									item.fav=true
								}
							})
							return item
						})
						let c=uni.current_this4.store_infos.length
						for(let i=0;i<c;i++)
							uni.current_this4.store_infos.pop()
						value.data.value.forEach(item=>{
							item.arr2=[]
							let n=item.author.split('')
							let n2=text.split('')
							// 匹配
							// 先进行单个匹配，
								// 若匹配成功，再查看匹配条件字符串的长度，
									// 再进行下一组匹配
										// 匹配成功
							// 返回添加《继续》
										// 匹配失败，结束
								for(let i=0;i<n.length;i++){
									let flag=true
									let count=i
									if(n[i]==n2[0]){
										let flag2=false
										for(let j=0;j<n2.length;j++){
											if(n[count]!=n2[j])
												flag2=true
											count++
										}
										if(!flag2)
											flag=false
									}
										// 查看匹配长度
										// 查看下一组
									if(flag){
										// 有不一样的,跳过
										item.arr2.push({flag:false,txt:n[i]})
									}else{
										// 匹配成功，添加
										item.arr2.push({flag:true,txt:n.join('').substring(i,count)})
										// 跳到匹配那里
										i=--count
									}
								}
						})
						value.data.value.forEach(item=>{
							item.arr=[]
							let n=item.book_name.split('')
							let n2=text.split('')
							// 匹配
							// 先进行单个匹配，
								// 若匹配成功，再查看匹配条件字符串的长度，
									// 再进行下一组匹配
										// 匹配成功
							// 返回添加《继续》
										// 匹配失败，结束
								for(let i=0;i<n.length;i++){
									let flag=true
									let count=i
									if(n[i]==n2[0]){
										let flag2=false
										for(let j=0;j<n2.length;j++){
											if(n[count]!=n2[j])
												flag2=true
											count++
										}
										if(!flag2)
											flag=false
									}
										// 查看匹配长度
										// 查看下一组
									if(flag){
										// 有不一样的,跳过
										item.arr.push({flag:false,txt:n[i]})
									}else{
										// 匹配成功，添加
										item.arr.push({flag:true,txt:n.join('').substring(i,count)})
										// 跳到匹配那里
										i=--count
									}
								}
						})
						uni.current_this4.store_infos.push(...value.data.value)
						uni.current_this4.search_state=false
						uni.current_this4.skip+=uni.current_this4.count
						uni.hideLoading()
					},fail(e) {
						uni.hideLoading()
						uni.showToast({
							icon:'error',
							title:"加载失败"
						})
					}
				})
				// 搜索
					uni.setStorage({
						key:'search_record',
						data:search_record
					})
			}
			
			function search(t){
				uni.showLoading({
					title: '书籍加载中',
				mask:true
				});
				let text=search_text.t.length?search_text.t:default_search_text.value
				if(typeof t === 'string')
					text=t
				search_record.push(text)
				if(search_record.length>6)
					search_record.shift()
				search_text.t=text
				uni.request({
					url:'https://www.mynameisczy.cn:5351/SearchBookInfo',
					method:"POST",
					data:{
						book_name:text,
						skip:skip.value,
						count:count.value
					},success(value) {
						if(value.data.value.length<=0){
							uni.hideLoading()
							uni.showToast({
								title:'没有更多了'
							})
							return
						}
						value.data.value.forEach(item=>{
							item.fav=false
						})
						// 如果找到相同的那么设置为true
						value.data.value=value.data.value.map(item=>{
							uni.current_this4.user_bookshelf.forEach(item2=>{
								if(item.book_name==item2){
									item.fav=true
								}
							})
							return item
						})
						value.data.value.forEach(item=>{
							item.arr2=[]
							let n=item.author.split('')
							let n2=text.split('')
							// 匹配
							// 先进行单个匹配，
								// 若匹配成功，再查看匹配条件字符串的长度，
									// 再进行下一组匹配
										// 匹配成功
							// 返回添加《继续》
										// 匹配失败，结束
								for(let i=0;i<n.length;i++){
									let flag=true
									let count=i
									if(n[i]==n2[0]){
										let flag2=false
										for(let j=0;j<n2.length;j++){
											if(n[count]!=n2[j])
												flag2=true
											count++
										}
										if(!flag2)
											flag=false
									}
										// 查看匹配长度
										// 查看下一组
									if(flag){
										// 有不一样的,跳过
										item.arr2.push({flag:false,txt:n[i]})
									}else{
										// 匹配成功，添加
										item.arr2.push({flag:true,txt:n.join('').substring(i,count)})
										// 跳到匹配那里
										i=--count
									}
								}
						})
						
						value.data.value.forEach(item=>{
							item.arr=[]
							let n=item.book_name.split('')
							let n2=text.split('')
							// 匹配
							// 先进行单个匹配，
								// 若匹配成功，再查看匹配条件字符串的长度，
									// 再进行下一组匹配
										// 匹配成功
							// 返回添加《继续》
										// 匹配失败，结束
								for(let i=0;i<n.length;i++){
									let flag=true
									let count=i
									if(n[i]==n2[0]){
										let flag2=false
										for(let j=0;j<n2.length;j++){
											if(n[count]!=n2[j])
												flag2=true
											count++
										}
										if(!flag2)
											flag=false
									}
										// 查看匹配长度
										// 查看下一组
									if(flag){
										// 有不一样的,跳过
										item.arr.push({flag:false,txt:n[i]})
									}else{
										// 匹配成功，添加
										item.arr.push({flag:true,txt:n.join('').substring(i,count)})
										// 跳到匹配那里
										i=--count
									}
								}
						})
						uni.current_this4.store_infos.push(...value.data.value)
						uni.current_this4.search_state=false
						uni.current_this4.skip+=uni.current_this4.count
						uni.hideLoading()
					},fail(e) {
						uni.hideLoading()
						uni.showToast({
							icon:'error',
							title:"加载失败"
						})
					}
				})
				// 搜索
					uni.setStorage({
						key:'search_record',
						data:search_record
					})
			}
			function clear_text(){
				search_state.value=true
				search_text.t=''
			}
			function clear_search_record(){
				let c=search_record.length
				for(let i=0;i<c;i++)
					search_record.pop()
				uni.setStorage({
					key:'search_record',
					data:[]
				})
			}
			return {load_state,search2,skip,count,user_bookshelf,hot,getHotBook,request_book_info,search_state,clear_text,head_height,store_infos,book_wh,default_search_text,info,search,clear_search_record,search_record,search_text}
		}
	}
</script>

<style lang="less" scoped>
	.container {
		font-size:16px;
		overflow: hidden;
		// font-size: 14px;
		line-height: 24px;
		width:100%;
		height:100%;
	}
	.history{
		// display: flex;
		// flex-direction: column;
	}
	.search_record{
		width:100%;
		display: flex;
		column-count: 3;
		flex-wrap: wrap;
		&>view{
			padding:5px 10px;
			background:rgba(0,0,0,0.05);
			color: gray;
			margin:5px 5px;
			border-radius:15px;
		}
	}
	.container2{
		background-color: white;
		display: flex;
		flex-direction: column;
		&>.searchBar{
			display: flex;
			&>view{
				flex-grow: 1;
				display: flex;
				justify-content: center;
				align-items: center;
			}
			&>.searchInput{
				min-height:100%;
				max-height:100%;
				max-width:85%;
				min-width:85%;
				background-color: rgb(244,244,244);
				padding:0 10px;
				justify-content: center;
				align-items: center;
				display: flex;
				box-sizing: border-box;
				&>uni-icon{
					flex-grow: 1;
				}
				&>input{
					height:100%;
					margin-left:5px;
					flex-grow: 1;
				}
			}
			&>.searchBtn{
				justify-content: flex-end;
				color:rgb(243,179,62)
			}			
		}
		&>view{
			// padding:0 20px;
			padding:13px 20px 5px 20px;
			box-sizing: border-box;
			flex-grow: 1;
			// border-bottom: 1px solid red;
		}
	}
	.title{
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom:5px;
		box-sizing: border-box;
		border-bottom:1px solid rgb(234,234,234);
		&>view{
			flex-grow: 1;
		}
	}
</style>
