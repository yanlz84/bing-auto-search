// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.39
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
var default_search_words = ["习主席致敬老战士的动人瞬间", "乌外长：乌方准备无条件停火至少30天", "特朗普：印巴已同意立即全面停火", "职业上新！42个新工种亮相", "中美经贸高层会谈在瑞士举行", "苹果宣布调价 多款iPhone降价超千元", "网警查处一起法律服务公司侵公案", "巴军方喊话印度：别活在宝莱坞电影里", "75岁董事长赤膊秀肌肉代言抗衰产品", "婚姻登记实现全国通办", "南航客机刚离开交战区 印度发射导弹", "河南一地众人下河摸金？当地回应", "印度70%电网瘫痪 当地华人发声", "专家：巴基斯坦400架无人机立大功", "曝小S挨个打电话恳请众星悼念大S", "李凯馨回应辱华录音：绝不是我说的话", "巴基斯坦战斗机进入印度领空", "印度称不会升级冲突", "吉林市一商场突发火灾", "印度要求封禁8000多个社媒账号", "美国被曝将请求中国取消稀土限制", "江疏影工作室回应：呵呵", "主播直播战斗机起降 引来境外间谍", "印度军方否认防空系统被摧毁", "印“阵风”飞行员通话录音：僚机爆炸", "贵州一地突降冰雹 有人受伤鸡被砸死", "谢娜和拖把撞造型", "李现呼吁不购买不传播路透内容", "结婚离婚为什么不需要户口本了", "欧洲多国领导人抵达基辅进行访问", "范丞丞叫宋雨琦邪恶双马尾", "刘德华自曝曾交友不慎被人出卖", "葬礼突遇狂风暴雨 墙体倒塌致3死7伤", "深圳退休夫妻负债超1亿申请破产清算", "雷军：过去一个多月是我最艰难的时间", "幸福航空全面停航 飞行员直播聊欠薪", "孙颖莎《嘉人》杂志破销售记录", "印度出现“恐慌性抢购”", "专家：印电网瘫痪程度待进一步验证", "骑士大胜步行者 系列赛大比分1-2", "原声直击：多架歼-10实战硬刚外军机", "巴空军基地遭印导弹袭击 火光冲天", "上门做饭月薪近2万被质疑 女子回应", "巴方称已打击20多处印度军事设施", "战觉城N98格斗盛宴", "媒体评结婚不要户口本：挣脱父母之命", "章子怡出席《卧虎藏龙》25周年放映会", "浙江一电瓶车闯红灯被轿车撞飞", "范玮琪悼念文章写错大S名字", "为啥以前结婚得带户口本", "普京拥抱后拉住巴西总统拍照"]

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
