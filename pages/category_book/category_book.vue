<template>
	<view>
		<navigation :show_back="1">
			{{title}}
		</navigation>
			<view class="container" :style="{marginTop:container_margin+10+'px'}">
				<bookSearchPage :navigation_hei='0' :load_state='load_state' :tolower="getCategoryBook" :book_wh="book_wh" :store_infos="store_infos" :store='store' v-if="store_infos.length"></bookSearchPage>
				<h1 v-if="!store_infos.length" style="text-align: center;color:gray;font-size: 18px;">敬请期待</h1>
			</view>
	</view>
</template>	

<script>
	import {ref,reactive,watch,computed} from 'vue'
	import bookSearchPage from '../../components/book_search/book_searchPage.vue'
	import navigation from '../navigation/navigation_all.vue'
	import {useStore} from 'vuex'
	export default {
		onLoad(e) {
			console.log(e);
			this.title=e.title
			this.book_wh=Number(e.book_wh)
			this.getCategoryBook()
		},
		components:{
			navigation,bookSearchPage
		},
		setup(props) {
			const store=useStore()
			let title=ref('')
			let count=ref(15)
			let skip=ref(0)
			let load_state=reactive({state:0})
			let book_wh=ref(0)
			let store_infos=reactive([])
			let container_margin=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			function getCategoryBook(){
				uni.showLoading({
					title:'书籍加载中'
				})
				load_state.state=1
				uni.request({
					url:'https://www.mynameisczy.asia:5351/getBookInfo_category',
					method:'POST',
					data:{
						count:count.value,
						skip:skip.value,
						category:title.value
					},
					success(value) {
						store.getters.fav_book.forEach(item=>{
							value.data.value.forEach(item2=>{
								if(item2.book_name==item){
									item2.fav=true
								}
							})
						})
						store_infos.push(...value.data.value)
						uni.hideLoading()
						setTimeout(()=>{
							load_state.state=0
						},1000)
						skip.value+=count.value
					},fail(e) {
						setTimeout(()=>{
							load_state.state=0
						},1000)
						uni.hideLoading()
						uni.showToast({
							icon:'error',
							title:'加载失败'
						})
					}
				})
			}
			function tolower(){
				console.log('触底了')
			}
			function scroll_fun(e){
				console.log(e);
			}
			return {scroll_fun,load_state,count,book_wh,title,tolower,getCategoryBook,container_margin,store_infos,store}
		},
		methods: {
			
		}
	}
</script>

<style lang="less">
	.container {
		overflow: hidden;
		padding: 20px 15px 20px 15px;
		font-size: 14px;
		line-height: 24px;
		box-sizing: border-box;
		max-width:100%;
		max-height:100%;
		min-height:100%;
		display: flex;
		flex-direction: column;
		&>view{
			flex-grow: 1;
		}
	}
</style>
