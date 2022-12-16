<template>
	<view class="container">
		<view class="font_size" :style="{minHeight:passage_height+'px'}">
				字号设置:{{font_size.size}}
			<slider @change="slider_change" min="18" max="40" :value="font_size.size" style="width:100%;"/>
		</view>
	</view>
</template>

<script>
	import {ref,reactive,watch} from 'vue';
	export default {
		props:['font_size','passage_height','slider_change'],
		setup() {
			return{
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
