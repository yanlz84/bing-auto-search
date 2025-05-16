// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.51
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["这张毕业证签发人是习近平", "正部级蓝天立被查 5天前曾公开露面", "女演员戴230万耳环引质疑 官方介入", "四部门加大对科技创新金融支持", "新冠感染又抬头？专家回应", "终于 俄罗斯和乌克兰谈上了", "3名性侵害未成年人罪犯执行死刑", "朱婷妹妹保送浙大被质疑 校方回应", "女生花20万买黄金亏掉两个月工资", "京津冀局地11级雷暴大风或大冰雹", "中方拟调整稀土出口管制 外交部回应", "福建屏南翻船致6人失踪？假", "女星父亲：百万耳环非正品 我没贪污", "格莱美奖评委直播锐评《歌手2025》", "鹿晗创作新歌疑回应分手传闻", "北京交警：请选择合法停车位置避雨", "刘晓庆否认偷税后举报人再发声", "女子称用香皂洗澡洗出一枚金币", "印度对中国媒体下黑手", "北京车主为应对冰雹棉被纸箱齐上阵", "乌军一架F-16战机在战斗中坠毁", "汪小菲婚礼地点曝光", "中方：坚决反对美恶意打压中国芯片", "邱贻可谈英语交流秘诀", "今麦郎董事长回应代工", "《歌手2025》今晚开播", "张泽群晒主持人大合照", "广西：没有免罪“丹书铁券”", "郑钦文1-2高芙无缘罗马站决赛", "汽车新规来了 AEBS将强制安装", "河南女排4个健将申请仅朱婷妹妹通过", "卢伟冰：小米Civi系列将对标苹果", "吴艳妮打破首都高校女子100栏纪录", "美国加州50多只鸟空中突然爆炸", "赵丽颖被曝恋情 冯绍峰评论区沦陷", "国乒主力当陪练 王楚钦给男双备战", "男子患阿尔茨海默病走失 7旬老母苦寻", "男子湿鞋不换致高烧不退感染丹毒", "龙门石窟千年菩提已开出满树繁花", "郑钦文回应不敌高芙", "北京再增2万个新能源小客车指标", "王楚钦说不会给自己定多高的目标", "郑钦文输球太遗憾 赛季仍0冠", "特朗普：俄乌谈判没我不行", "我军为何要新组建三所军事院校", "儿子中1000万 父亲生疑砍伤前妻", "浙江金融办原副主任潘广恩被双开", "母亲把脑瘫儿子送进北大和哈佛", "邱贻可谈未来规划", "刘国中将出席第78届世界卫生大会", "甘肃一地现大量飞鸟盘旋"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
