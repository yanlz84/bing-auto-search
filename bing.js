// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.308
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
var default_search_words = ["看总书记关心的清洁能源这样发电", "央视曝光直播间“高端四件套”猫腻", "以总理：绝不会有巴勒斯坦国 等着瞧", "长春航空展这些“首次”不要错过", "租客长租15年不到1年就被劝退", "风王“桦加沙”体型超整个广东省", "9月23日晚8点将上演“龙收尾”天象", "马斯克特朗普闹掰后首次同框", "我们为什么要去撞击小行星", "美国军工巨头主动曝光战机", "43岁二胎妈妈患阿尔茨海默病", "“学校组织签器官捐赠书”系谣言", "喜马拉雅放烟花 人们担忧的是什么", "iPhone 17橙色斜挎挂绳卖断货", "00后女子醉驾撞死3人案将开庭", "专家称烟花秀可能影响鼠兔", "三所“零近视”小学带来的启示", "超强台风“桦加沙”威力有多强", "刘慈欣称不介意修改三体遭AI反对", "中国消失的森林正“全盘复活”", "老奶奶去世3年 邻居帮打扫门前落叶", "黄灿灿赚的第一笔钱给初恋补交学费", "被3只宠物狗追咬胎停 孕妇最新发声", "柯克追悼会 狙击手站楼顶向民众挥手", "“桦加沙”致灾程度堪比“山竹”", "澳加英宣布承认巴勒斯坦国", "受台风影响广东江门实行“五停”", "葡萄牙正式承认巴勒斯坦国", "女子花10万云养猪生重病难退钱", "英国航母从南海“溜了”", "一代人有一代人的月饼", "女儿发现父亲500多万遗产用于保健", "今年最强台风来袭", "巴西邀多国在纽约办论坛 美国除外", "莫迪称印度真正敌人是对外依赖", "飞机“付费选座”引争议 专家：违法", "外媒：印尼批准采购意大利退役航母", "刘强东“10年1元年薪”之约到期", "以抗议者：我们的总理正让公民去送死", "曝特朗普政府或再次向以色列军售", "委内瑞拉在西北部启动反毒品行动", "博茨瓦纳暴雨中绝杀美国队夺金", "韩国组合获中国羽毛球大师赛男双冠军", "利比亚首都附近区域发生武装冲突", "意大利游客在成都突发急症获救治", "五角大楼新规：记者进入需签保密协议", "以军称已有超55万人离开加沙城", "民警“话疗”3小时保住老人60万", "男子杀人后逃离又杀路人被核准死刑", "太原马拉松部分路段遍地垃圾", "山姆上架太二酸菜鱼预制菜"]

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
