// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.302
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
var default_search_words = ["金秋里 听历史的声息拂过耳畔", "台风“米娜”将带来大暴雨、特大暴雨", "胖东来回应酥饼10号揽收11号生产", "端起历史的望远镜", "香港黄金盗窃案已拘捕12男1女", "美国再次一票否决安理会加沙决议", "公安部公布10起网络违法犯罪案例", "高校捞80000斤鱼请全校师生吃", "中东之战 巴基斯坦成了最大赢家", "导演让刚出生女儿出演剖腹取婴镜头", "俄堪察加近海发生7.8级地震", "“中国三农”APP系假冒", "19岁女子腹痛就诊后2小时分娩", "多人因忘关闭自动续费被扣数千元", "《731》导演回应为何回避血腥场面", "美股再创收盘新高 英特尔涨超22%", "《731》所有日本角色均由日籍演员出演", "男童关家中半年死亡因被疑非亲生", "iPhone17发售 直击北京苹果店", "奥巴马：我现在不是总统冲我喊没用", "胡塞武装：袭击以色列并命中军事目标", "91岁细菌战幸存者观看《731》后发声", "“张云龙”诱骗至少4人到柬电诈园区", "广州不锈钢盲道引发多人摔倒", "夫妻借100万还159万仍被追讨百万", "陈佩斯为《731》包场30场", "21名受处分干部整改后获进一步使用", "米娜+桦加沙+浣熊 三台风相继生成", "震撼大图！空对空视角看中国空军战机", "特朗普带小女儿蒂芙尼参加英国国宴", "以军证实无人机击中该国南部一建筑", "法国逾50万人罢工 反对财政紧缩方案", "《731》导演：让电影堂堂正正走进日本", "卫星图像显示以坦克集结加沙城周围", "“承影”战术无人机甲登场", "胡塞武装：袭击以色列多个目标", "电影《731》单日票房破3亿", "特朗普因直升机故障改乘备用机", "刚果（金）埃博拉疫情已致31人死亡", "必胜客橙汁是果粒橙加冰？客服回应", "气象局回应河南永城现“黑云压城”", "樊振东的纪念衫在德国供不应求", "中方回应两家中企被索赔800亿美元", "曾用10年退休金补仓的爷叔解套了", "男子转情人1340万 66岁原配起诉返还", "孙颖莎回应世乒赛夺冠后落泪", "泽连斯基视察乌东前线", "印尼巴布亚省发生6.1级地震", "《731》海报上的防毒面具实物长啥样", "乌少校因“与俄方合作”被判15年", "新加坡防长发言引用中国谚语"]

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
