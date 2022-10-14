<template>
		<navigation>
			我的书架
		</navigation>
	<view class="container" :style="{marginTop:container_margin+10+'px'}">
		<book_list :store_infos="store_infos" :store='store' v-if="store_infos.length"></book_list>
		<h1 v-if="!store_infos.length" style="text-align: center;color:gray;font-size: 18px;">暂无</h1>
	</view>
</template>

<script>
	import hooks from '../../components/store/hooks.js'
	import navigation from '../navigation/navigation_all.vue'
	import {reactive,ref,watch,computed} from 'vue'
	import book_list from '../../components/book_list/book_list.vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,book_list
		},
		setup() {
			const store=useStore()
			let user_bookshelf=computed(()=>{
				let fav=store.getters.fav_book
				return fav
			})
			let store_infos=reactive([])
			watch(user_bookshelf,function(n){
				let length=store_infos.length
				for(let i=0;i<length;i++)
					store_infos.pop()
				n.forEach(item=>{
					search(item)
				})
			},{deep:true,immediate:true})
			// 拿到收藏
			const {request_book_info}=hooks()
			
			function search(t){
				uni.request({
					url:'https://www.mynameisczy.asia:5351/SearchBookInfo',
					method:"POST",
					data:{
						book_name:t
					},success(value) {
						let arr=[]
						value.data.value.forEach((item,index)=>{
							if(item.book_name==t){
								item.fav=true
								arr.push(item)
							}
							if(index==value.data.value.length-1){
								let set=new Set([...arr,...store_infos])
								let length=store_infos.length
								for(let i=0;i<length;i++)
									store_infos.pop()
								store_infos.push(...set)
							}
						})
						
					},fail(e) {
						uni.showToast({
							icon:'error',
							title:"加载失败"
						})
					}
				})
			}
			
			let container_margin=ref(uni.getMenuButtonBoundingClientRect().height*1.7);
			return {user_bookshelf,search,store,store_infos,container_margin}
		},
		methods: {
		}
	}
</script>

<style lang="less" scoped>
	.container {
		padding: 20px 15px 20px 15px;
		font-size: 14px;
		line-height: 24px;
		box-sizing: border-box;
		width:100%;
		height:100%;
		display: flex;
		flex-direction: column;
		&>view{
			flex-grow: 1;
		}
	}
</style>