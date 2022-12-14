<template>
	<view class="container">
		<view class="font_size" :style="{minHeight:passage_height+'px'}">
				字号设置:{{font_size.size}}
			<slider @change="slider_change" min="18" max="40" :value="font_size.size" style="width:100%;"/>
		</view>
		<view class="auto_scroll">
			自动滚动
			<slider min="0" step="2" :value="auto_scroll" max="10" @change="auto_scroll_fun" :checked="auto_scroll"></slider>
		</view>
	</view>
</template>

<script>
	import {ref,reactive,watch} from 'vue';
	export default {
		props:['font_size','timer','passage_height','slider_change','auto_scroll_fn','timer'],
		setup(props) {
			
			watch(()=>props.timer,(new_timer)=>{
				if(new_timer.id==0){
					auto_scroll.value=0
				}
			},{deep:true})
			
			function auto_Scroll(){
				// 拿到总
			}
			let auto_scroll=ref(0);
			
			function auto_scroll_fun(e){
				console.log(e,'e');
				auto_scroll.value=e.detail.value
				// 这里开始滚动
				if(auto_scroll.value){
					// 开启滚动涵数
					props.auto_scroll_fn(true,auto_scroll.value*3)
				}else{
					// 关闭滚动函数
					props.auto_scroll_fn(false)
				}
			}
			return{
				auto_scroll_fun,auto_scroll,auto_Scroll
			}
		}
	}
</script>

<style scoped lang="less">
	.container{
		box-shadow:0 -4px 10px -3px gray;
		display: flex;flex-direction: column;
		text-align: start;
		padding:20px 20px 20px 20px;
		&>view{
			flex-grow: 1;
		}
		box-sizing: border-box;
	&>.auto_scroll{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		&>slider{
			width: 100%;
			padding:0 10px;
			box-sizing: border-box;
		}
	}
	&>.font_size{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		&>slider{
			width: 100%;
			padding:0 10px;
			box-sizing: border-box;
		}
		&>view{
			display: flex;
			max-height:50%;
			min-height:50%;
			flex-grow: 1;
			&>.searchBtn{
				&:active{
					color: black;
				}
			}
		}
	}
	}
</style>
