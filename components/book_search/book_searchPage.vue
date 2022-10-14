<template>
	<scroll-view  v-if="store_infos.length" @scrolltolower="fn" :scroll-y="true" :style="{height:info.screenHeight-navigation_hei*2.3+'px',overflow:'hidden'}">
		<view  class="bill" v-for="(item,index) in store_infos" :key="index">
		<uni-popup ref="popup" background-color="#fff">
			<view class="popup-content">
				<text>简介</text>
				<text>{{content}}</text>
			</view>
		</uni-popup>
		<view class="store_infos" :style="{height:book_wh*1.1+'px',minHeight:book_wh*1.1+'px',maxHeight:book_wh*1.1+'px'}" >
			<view :style="{maxWidth:book_wh+'px',minWidth:book_wh+'px',minHeight:book_wh*1.2+'px',maxHeight:book_wh*1.2+'px'}">
				<image  @click.stop="toggle(item)" :src="'https://www.mynameisczy.asia/image/'+item.book_name+'.jpg'" :style="{maxWidth:book_wh*0.8+'px',minWidth:book_wh*0.8+'px',minHeight:book_wh*1+'px',maxHeight:book_wh*1+'px'}"></image>
			</view>
			<view class="title">
				<view style="font-weight:bold;font-size:17px;display: flex;justify-content: space-between;">
					{{item.book_name}}
					<uni-fav class="favBtn" :checked='item.fav' circle="true" bgColorChecked="#dd524d" @click.stop="fav_book(item)"/>
				</view>
				<view style="color:gray;font-size:13px;"  @click.stop="request_book_info(item)">
					<!-- <view style="display: inline-block;font-size:16px;color: red;">{{item.score}}分</view> -->
					<text decode>
						作者: {{item.author}}
					</text>
						<view style="display: flex;flex-direction:column;vertical-align: center;">
							<text decode style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
								总章节: {{item.passage_count}}&emsp;
								类型: {{item.book_type}}
							</text>
							<view style="display: flex;flex-direction:row;justify-content: space-between;vertical-align: center;">
								<text>
									小说情况：{{item.book_state}}
								</text>
								<text decode style="display: block;font-size:16px;color: red;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
									进入
								</text>
							</view>
						</view>
					<!-- 再写一个简介（多余的使用省略好） -->
				</view>
			</view>
		</view>
<!-- 		<view class="bottom">{{refresh_info}}
		<uni-icons :type="refresh_state_info"></uni-icons>
		</view> -->
		</view>
	</scroll-view>
	<view v-if="!store_infos.length" class="sorry">
		<view>此书暂时未上线,请敬请期待</view>
	</view>
</template>

<script>
	import {useStore} from 'vuex'
	import {reactive,ref} from 'vue'
	import hooks from '../store/hooks.js'
	import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/popup.js'
	export default {
		name:"book_searchPage",
		components:{
			uniPopup
		},
		props:['book_wh','store_infos','tolower','skip','count','load_state','navigation_hei'],
		methods:{
			toggle(item){
				if(this.load_state.state==1){
					return
				}
					this.content=item.book_introduce
					this.$refs.popup[0].open()
				}
		},
		setup(props) {
			let content=ref('')
			const store=useStore()
			let user_bookshelf=reactive([])
			let info=reactive(uni.getSystemInfoSync())
			const {request_book_info}=hooks()
			function fav_book(e){
				if(!store.getters.login_state){
					uni.showToast({
						title:'清先登录',
						icon:'error'
					})
					return
				}
				store.dispatch("fav_book",e)
			}
			function fn(){
				props.tolower()
			}
			return {fn,request_book_info,fav_book,content,info}
		}
	}
</script>

<style lang="less" scoped>
	.popup-content{
		box-sizing: border-box;
		padding:20px;
		&>text:first-child{
			margin-bottom:15px;
			font-weight:bold;
		}
		&>text{
			text-align: center;
			display: block;
			font-size:20px;
		}
	}
	.title{
		justify-content: space-around;
		display: flex;
		flex-direction: column;
	}
	.bill:first-child{
		margin-top:0px;
	}
	.bill{
		margin-top:10px;
		background-color: white;
		display: flex;
		flex-direction: column;
		padding:0px 10px 0px 10px;
		box-sizing: border-box;
			&>.bottom{
				height:30px;
				display: flex;
				justify-content: center;
				align-items: center;
				width:100%;
				color:gray;
			}
			&>.store_infos{
				margin:5px 0;
				&:active{
					background-color: rgba(0,0,0,.1);
				}
				.title{
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					height:100%;
					&>view{
						flex-grow: 1;
					}
				}
				&>view{
					flex-grow: 1;
					padding:10px 10px;
					box-sizing: border-box;
				}
				justify-content: center;
				align-items: center;
				display: flex;
				background-color: white;	
			}
		}
		.sorry{
			padding:20px;
			box-sizing: border-box;
			display: flex;
			justify-content: center;
			align-items: center;
			&>view{
				color: gray;
			}
		}
</style>