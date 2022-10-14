<template>
	<text decode="true" space="nbsp" :style="{fontSize:font_size.size+'px',lineHeight:font_size.size*2+'px'}">
		{{current_book.content}}
	</text>
</template>

<script>
	export default {
		props:['font_size','current_book']
	}
</script>