<style>
    .list-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .list-item {
        display: flex;
        width: 100%;
        gap: 10px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
</style>

<div class="list-container">
    <div class="list-item">
        <slot />
    </div>
</div>

