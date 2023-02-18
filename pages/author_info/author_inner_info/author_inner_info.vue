<template>
	<navigation show_back='true'>
		作者信息
	</navigation>
		<scroll-view class="describe" :scroll-y="true" :style="{marginTop:container_margin+30+'px',height:info.screenHeight-container_margin-50+'px'}">
			<view class="author_info">
				<view class="img">
					<image :src="author.avatar" style="height:100%;width:100%" mode=""></image>
				</view>
				<view class="author">
					作者:{{author.name}}
				</view>
			</view>
			<view class="description">
				&emsp;&emsp;{{author.description}}
			</view>
			<view class="author_books">
				<view class="tit">
					相关作品
				</view>
				<view class="books">
					<view class="book" v-for="(item,index) in books" :key="index" @click="request_book_info(item)">
						<view class="img">
							<image @error="image_load_err(item)" :src="item.src?item.src:'https://www.mynameisczy.asia/image/'+item.book_name+'.jpg'" ></image>
						</view>
						<view class="book_name">
								{{item.book_name}}
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
</template>

<script>
	import {reactive,ref} from 'vue'
	import {useStore} from 'vuex'
	import navigation from '../../navigation/navigation_all.vue'
	export default {
		onLoad(res) {
			let info=JSON.parse(res.item)
			Object.keys(this.author).forEach(item=>{
				this.author[item]=info[item]
			})
			uni.current_this26=this
			
			// 根据作者名，拿到对应的书籍
			
			uni.request({
				url:"https://www.mynameisczy.asia:5351/SearchAuthorBooks",
				method:'POST',
				data:{
					author:this.author.name
				},
				success(res) {
					uni.current_this26.books.push(...res.data.value)
				}
			})
			
		},
		components:{
			navigation
		},
		setup() {
			let books=reactive([])
			let container_margin=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			let info=reactive(uni.getSystemInfoSync())
			const author=reactive({
				name:'',avatar:'',description:'',passage_count:0
			})
			const store=reactive(useStore())
			
			function request_book_info(book){
				uni.showLoading({
					title:'书籍加载中',
					mask:true
				})
				if(store.getters.login_state<=0){
					uni.showToast({
						icon:'error',
						title:'请先登录'
					})
					return
				}
				// 当数据存在，那么就跳过
				uni.getStorage({key:book.book_name}).then(()=>{
					uni.navigateTo({
						url:"/pages/current_book_page/current_book_page?book_name="+book.book_name+'&passage_count='+book.passage_count,
						animationType:'slide-in-right'
					})
				}).catch(e=>{
					uni.request({
						url:'https://www.mynameisczy.asia:5351/getBookPassage',
						method:'POST',
						data:{
							book_name:book.book_name,
							skip:0,
							count:10
						},
						success(value) {
							if(value.data.value.length<=0){
								uni.showToast({
									title:"该书籍暂时还未上架",
									icon:'none'
								})
								return
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
						},complete() {
							uni.hideLoading()
						}
					})
				})
			}
			function image_load_err(item){
				item.src='https://www.mynameisczy.asia/image/image_load_error.jpeg'
			}
			return {author,container_margin,info,store,request_book_info,image_load_err,books}
		},
		methods: {
			
		}
	}
</script>

<style scoped lang="less">
.describe{
	padding:0 20px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	&>view{
		flex-grow: 1;
	}
	.author_info{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		.img{
			height:200px;
			border: 10px solid white;
			border-radius: 20px;
			overflow: hidden;
			width:150px;
		}
		.author{
			border-radius: 10px;
			padding:10px 10px;		
			background-color: white;
			margin-top: 10px;
			margin-bottom:10px;
			text-align: center;
		}
	}
	.description{
		border-radius: 10px;
		padding:10px 10px;
		line-height:40px;
		box-sizing: border-box;
		background-color: white;
		font-size:20px;
	}
		}
.author_books{
	margin-top: 30px;
		width:100%;
		padding-top:10px;
		display: flex;
		background: white;
		border-radius: 10px;
		flex-direction: column;
		box-sizing: border-box;
		text-align: center;
		&>.tit{
			font-size:23px;
		}
		&>.books{
			display: flex;
			justify-content: space-around;
			padding: 10px 20px;
			column-count: 2;
			background-color: white;
			flex-wrap: wrap;
			box-sizing: border-box;					
			&>.book{
				margin:0 10px 20px 10px;
			}
		}
}
		.img{
			margin-bottom: 10px;
			width:80px;
			border-radius: 5px;
			overflow: hidden;
			height:100px;
			&>image{
				width:100%;
				height:100%;
			}
		}
		.book_name{
			width:80px;
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap
		}
</style>
