// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.334
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
var default_search_words = ["很重要的是看老年人幸福不幸福", "红色预警！强台风麦德姆最新路径公布", "歼-35与歼-35A机库首度公开", "本世纪最晚中秋来了", "被悟空带火的小西天：游客暴增百倍", "多地紧急通知：停课停工停业停运停航", "广东省委副书记：迅速进入临战状态", "新郎新娘还堵在高速 家里先开席了", "丈夫反对投资120万女子生气砸断餐桌", "王楚钦林诗栋夺冠后化身国乒喜剧人", "马斯克发布擎天柱机器人学功夫视频", "杭州逃逸豹子现身产3崽系谣言", "列车上铺男子跌落砸断10岁女孩腿骨", "男子在大兴安岭遇棕熊 附近垃圾成片", "谈判在即 以色列发动近百次袭击", "假期最忙“拍照主理人”获网友点赞", "男子接270单上门喂养 最高1单8100元", "注意！多地将有大暴雨 局地特大暴雨", "东北雨姐账号禁言将解封？多方回应", "昔日顶流“拉面哥”已转型带货主播", "女生瀑布前拍照 空中飘来一排人", "男子收3.5万报酬运送市值1.46亿毒品", "AI女演员震动好莱坞", "3岁男童从景区栈道旁缝隙坠落", "副局长办案时坠江殉职 女儿不满6岁", "美国团队将路灯改造成电动车充电桩", "乌一客运列车受袭起火车厢炸出大洞", "钱塘江现大面积“龙鳞潮”", "中国海警发布黄岩岛最新照片", "高市早苗对华政策将如何调整", "假期高速电动车“人等桩”", "景区回应男童坠落栈道已加装护栏", "近距离看王炸组合歼-10C和霹雳-15E", "45岁潘玮柏宣布再度减肥", "AG600飞机批产第三架机总装下线", "景区应急服务该不该发“天气财”", "美法官暂时禁止特朗普向波特兰派兵", "金正恩回应美国在韩国扩充军事资产", "淄博烧烤店下午就排队凌晨才收摊", "泰山连日降雨大风游客被迫躲厕所", "特朗普：以色列同意初步撤军路线", "以色列与哈马斯代表团将举行会谈", "WTT中国大满贯门票收入8700万元", "云南普洱市景谷县发生4.1级地震", "市民建议的哥懂粤语英语 官方回应", "武警官兵持续开展清淤与重建工作", "动物园回应老虎咬水管一动不动", "特朗普：将主持“史上最大”海军庆典", "马斯克称OpenAI估值过高", "泽连斯基签署多项针对俄罗斯制裁令", "英国今年已截获25.9万件假冒玩具"]

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
