<template>
	<scroll-view scroll-y="true" class="vessel" :style="{marginTop:head_height_child+25+'px',width:width+'px',height:(container_height-head_height_child-20)+'px'}">
		<slot></slot>
	</scroll-view>
</template>

<script>
	// 这是其他页
	// 不是tab页，tab页还需要减去底部
	import {reactive,ref} from 'vue'
	export default {
		setup() {
			let head_height_child=ref(uni.global.rect*1.7)
			let container_height=ref(uni.global.height)
			let width=ref(uni.global.width)
			return {head_height_child,container_height,width}
		}
	}
</script>

<style lang="less">
.vessel{
	width:100%;
}
</style>
