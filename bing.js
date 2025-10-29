// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.382
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
var default_search_words = ["“十五五”规划建议发布", "达成停火18天后 以总理下令袭击加沙", "“台独”沈伯洋被立案侦查意味什么", "“十五五”这项任务排首位", "这个培训班一半以上的警官不能露面", "今年是百年一遇的“晚重阳”", "新人拍婚纱照遭遇“黑天鹅抢新娘”", "男子10年进山371次捡了2万多斤垃圾", "睡前吃宵夜vs饿肚子睡觉 谁危害更大", "张学良侄孙在《人民日报》撰文", "“你们都是大人了 别再哭了”", "河南南阳雪降农田系谣言", "女子想为亡夫再生一个孩子遭拒", "特朗普径自走过日本国旗未鞠躬", "这群人用最“土”的办法造出原子弹", "美股三大股指续创新高 英伟达涨近5%", "特朗普访日在美士兵面前即兴起舞", "重阳节 把这些养老福利转发给家人", "飓风“梅丽莎”成新晋全球风王", "网购红牛变累牛困牛？红牛回应", "今日重阳", "一文读懂英伟达GTC大会黄仁勋演讲", "胡歌在西藏有新身份", "国乒三选手“一轮游”", "金价跌破3900美元 未来会是什么走势", "2000多年前的古人如何尊老敬老", "妈妈叮嘱吞10克黄金小孩别在外面拉", "重庆一体育生因色弱被大学退学", "神曲《没出息》更新", "年轻人DIY服装200元做出大牌同款", "正直播NBA：尼克斯vs雄鹿", "泽连斯基：准备与俄罗斯再打两三年", "港媒曝关淑怡已脱离危险", "美军机坠入南海是遭电磁攻击？想多了", "麻辣烫吃出整块抹布？门店：考虑报警", "你设置的密码真的安全吗", "女子花283万买翡翠原石 到货后傻眼", "吴石将军的副官聂曦为司局级", "宝宝巴士客服回应APP跳出成人广告", "“梅丽莎”逼近 多艘美军舰艇躲避", "女子体验沙滩车侧翻18根肋骨断裂", "未来十年有哪些治癌新科技", "大爷不慎打翻餐盘 老板立马重做了份", "四川自考最小考生仅9岁 官方回应", "萌娃手绘加密版《赠汪伦》", "牧民信了整蛊彩票坐火车去兑奖", "炒黄金期货赚14亿辞职？当事人否认", "Zeus回应止步S15八强", "老人捡生锈炮弹淡定拿到派出所上交", "路边小货车上装过亿现金？当地回应", "朝鲜进行舰地战略巡航导弹试射"]

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
